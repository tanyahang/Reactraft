const express = require('express');
const router = express.Router();

const componentController = require('../controllers/componentController');
const rectangleController = require('../controllers/rectangleController');

router.delete(
  '/delete/:componentId',
  rectangleController.deleteComponentRectangle,
  componentController.deleteComponentById,
  componentController.shiftComponentsAfterDelete,
  (req, res) =>
    res.status(200).send({
      shifted: res.locals.shiftedIndices,
      indexDeleted: res.locals.indexDeleted,
    })
);

router.post(
  '/update-parent/:componentId',
  componentController.updateParentOrTag,
  componentController.resetParentHtml,
  (req, res) => res.status(200).send(res.locals)
);

router.post(
  '/update-tag/:componentId',
  componentController.updateParentOrTag,
  componentController.updateHtmlForAllSameComponents,
  (req, res) => res.status(200).send(res.locals)
);

router.post(
  '/update-position/:componentId',
  rectangleController.updateComponentRectanglePosition,
  (req, res) => res.status(200).send(res.locals.updatedRectangle)
);

router.post(
  '/update-rectangle-style/:componentId',
  rectangleController.updateComponentRectangleStyle,
  (req, res) => res.status(200).send(res.locals.updatedRectangle)
);

router.post(
  '/submit/:componentId',
  componentController.updateComponentForm,
  componentController.updateHtmlForAllSameComponents,
  (req, res) => res.status(200).send(res.locals.updatedComponent)
);

module.exports = router;
