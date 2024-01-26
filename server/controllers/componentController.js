const { Request, Response, NextFunction } = require('express');
const db = require('../models/dbModel');

// Create a default RootContainer component for a new design
const createRootComponent = (req, res, next) => {
  const pages = res.locals.design.pages;
  const pageId = pages[pages.length - 1]._id;
  return db
    .query(
      'INSERT INTO components (page_id, index, name) ' +
        'VALUES ($1, $2, $3) ' +
        'RETURNING *;',
      [pageId, 0, 'RootContainer']
    )
    .then((data) => {
      res.locals.design.pages[pages.length - 1].components = [data.rows[0]];
      return next(); // next middleware is rectangleController.createRootRectangle
    })
    .catch((err) =>
      next({
        log:
          'Express error handler caught componentController.createRootComponent middleware error' +
          err,
        message: { err: 'createRootComponent: ' + err },
      })
    );
};

const getComponents = async (req, res, next) => {
  try {
    const pages = res.locals.design.pages;
    const compPromises = pages.map((page) =>
      db.query('SELECT * FROM components WHERE page_id = $1;', [page._id])
    );
    const results = await Promise.all(compPromises);
    results.forEach((data, i) => {
      if (data.rows.length === 0) {
        throw new Error('A page has no components.');
      }
      pages[i].components = data.rows;
    });
    return next();
  } catch (err) {
    return next({
      log:
        'Express error handler caught rectangleController.getRectangles middleware error: ' +
        err,
      message: { err: 'getRectangles: ' + err },
    });
  }
};

const addNewComponent = async (req, res, next) => {
  const { pageId } = req.params;
  const { name, index, rootId } = req.body;
  let data;
  try {
    const prevComponentRes = await db.query(
      'SELECT * FROM components WHERE page_id = $1 AND name = $2;',
      [pageId, name]
    );
    if (prevComponentRes.rows.length === 0) {
      data = await db.query(
        'INSERT INTO components (page_id, name, index, parent_id) VALUES ($1, $2, $3, $4) RETURNING *;',
        [pageId, name, index, rootId]
      );
      res.locals.component = data.rows[0];
      return next();
    } else {
      const { html_tag, inner_html } = prevComponentRes.rows[0];
      console.log('in addNewComponent', prevComponentRes.rows[0]);
      data = await db.query(
        'INSERT INTO components (page_id, name, index, parent_id, html_tag, inner_html) ' +
          'VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;',
        [pageId, name, index, rootId, html_tag, inner_html]
      );
      console.log('in addNewComponent', data.rows);
      res.locals.component = data.rows[0];
      return next();
    }
  } catch (err) {
    return next({
      log:
        'Express error handler caught componentController.addNewComponent middleware error' +
        err,
      message: { err: 'addNewComponent: ' + err },
    });
  }
};

const deleteComponentById = (req, res, next) => {
  const { componentId } = req.params;
  return db
    .query('DELETE FROM components WHERE _id = $1 RETURNING index, page_id;', [
      componentId,
    ])
    .then((data) => {
      const { index, page_id } = data.rows[0];
      res.locals.indexDeleted = index;
      console.log('indexDeleted:', index);
      res.locals.pageId = page_id;
      return next();
    })
    .catch((err) =>
      next({
        log:
          'Express error handler caught componentController.deleteComponentById middleware error' +
          err,
        message: { err: 'deleteComponentById: ' + err },
      })
    );
};

const shiftComponentsAfterDelete = (req, res, next) => {
  const { indexDeleted, pageId } = res.locals;
  return db
    .query(
      'UPDATE components ' +
        'SET index = index - 1 ' +
        'WHERE page_id = $1 AND index > $2 ' +
        'RETURNING _id, index;',
      [pageId, indexDeleted]
    )
    .then((data) => {
      res.locals.shiftedIndices = data.rows;
      return next();
    })
    .catch((err) =>
      next({
        log:
          'Express error handler caught componentController.shiftComponentsAfterDelete middleware error' +
          err,
        message: { err: 'shiftComponentsAfterDelete: ' + err },
      })
    );
};

const updateParentOrTag = (req, res, next) => {
  const { componentId } = req.params;
  const { parentId, htmlTag } = req.body;
  const columnKey = parentId ? 'parent_id' : 'html_tag';
  const columnValue = parentId ? parentId : htmlTag;
  return db
    .query(
      `UPDATE components SET ${columnKey} = $1 WHERE _id = $2 RETURNING *;`,
      [columnValue, componentId]
    )
    .then((data) => {
      res.locals.componentId = componentId;
      res.locals.parentId = parentId;
      res.locals.htmlTag = htmlTag;
      res.locals.componentName = data.rows[0].name;
      res.locals.designId = data.rows[0].design_id;
      res.locals.innerHtml = data.rows[0].inner_html;
      return next();
    })
    .catch((err) =>
      next({
        log:
          'Express error handler caught componentController.updateParent middleware error' +
          err,
        message: { err: 'updateParent: ' + err },
      })
    );
};

const updateHtmlForAllSameComponents = (req, res, next) => {
  const { componentName, htmlTag, designId, innerHtml } = res.locals;
  console.log('updating html for all same components');
  if (!htmlTag) return next();
  return db
    .query(
      'UPDATE components SET html_tag = $1, inner_html = $4 WHERE name = $2 AND design_id = $3 RETURNING *;',
      [htmlTag, componentName, designId, innerHtml]
    )
    .then(() => next())
    .catch((err) =>
      next({
        log:
          'Express error handler caught componentController.updateHtmlForAllSameComponents middleware error' +
          err,
        message: { err: 'updateHtmlForAllSameComponents: ' + err },
      })
    );
};

const resetParentHtml = (req, res, next) => {
  const { parentId } = req.body;
  return db
    .query(
      'UPDATE components SET html_tag = $1, inner_html = $2 WHERE _id = $3;',
      ['<div>', '', parentId]
    )
    .then(() => next())
    .catch((err) =>
      next({
        log:
          'Express error handler caught componentController.resetParentHtml middleware error' +
          err,
        message: { err: 'resetParentHtml: ' + err },
      })
    );
};

const updateComponentForm = (req, res, next) => {
  const { componentId } = req.params;
  const { name, innerHtml, props, styles } = req.body;
  return db
    .query(
      'UPDATE components ' +
        'SET name = $1, ' +
        'inner_html = $2, ' +
        'props = $3, ' +
        'styles = $4 ' +
        'WHERE _id = $5 ' +
        'RETURNING *;',
      [
        name,
        innerHtml,
        JSON.stringify(props),
        JSON.stringify(styles),
        componentId,
      ]
    )
    .then((data) => {
      res.locals.updatedComponent = data.rows[0];
      res.locals.htmlTag = data.rows[0].html_tag;
      res.locals.componentName = data.rows[0].name;
      res.locals.designId = data.rows[0].design_id;
      res.locals.innerHtml = data.rows[0].inner_html;
      return next();
    })
    .catch((err) =>
      next({
        log:
          'Express error handler caught componentController.updateComponentForm middleware error' +
          err,
        message: { err: 'updateComponentForm: ' + err },
      })
    );
};

module.exports = {
  getComponents,
  createRootComponent,
  addNewComponent,
  deleteComponentById,
  shiftComponentsAfterDelete,
  updateParentOrTag,
  resetParentHtml,
  updateComponentForm,
  updateHtmlForAllSameComponents,
};
