import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import Helper from '/client/helper';
import Enums from '/lib/enums';
import {initExecuteQuery} from '/client/views/pages/browse_collection/browse_collection';
import {getSelectorValue} from '/client/views/query_templates_common/selector/selector';

var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by sercan on 06.01.2016.
 */
Template.updateMany.onRendered(function () {
    initializeOptions();
    Helper.changeConvertOptionsVisibility(true);
});

const initializeOptions = function () {
    var cmb = $('#cmbUpdateManyOptions');
    $.each(Helper.sortObjectByKey(Enums.UPDATE_OPTIONS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Helper.setOptionsComboboxChangeEvent(cmb);
};

Template.updateMany.executeQuery = function (historyParams) {
    initExecuteQuery();
    var selectedCollection = Session.get(Helper.strSessionSelectedCollection);
    var options = historyParams ? historyParams.options : getOptions();
    var selector = historyParams ? JSON.stringify(historyParams.selector) : getSelectorValue();
    var setObject = historyParams ? JSON.stringify(historyParams.setObject) : Helper.getCodeMirrorValue($('#divSet'));

    selector = Helper.convertAndCheckJSON(selector);
    if (selector["ERROR"]) {
        toastr.error("Syntax error on selector: " + selector["ERROR"]);
        Ladda.stopAll();
        return;
    }

    setObject = Helper.convertAndCheckJSON(setObject);
    if (setObject["ERROR"]) {
        toastr.error("Syntax error on set: " + setObject["ERROR"]);
        Ladda.stopAll();
        return;
    }
    setObject = {"$set": setObject};


    if (options["ERROR"]) {
        toastr.error(options["ERROR"]);
        Ladda.stopAll();
        return;
    }

    var params = {
        selector: selector,
        setObject: setObject,
        options: options
    };

    var convertIds = $('#aConvertObjectIds').iCheck('update')[0].checked;
    var convertDates = $('#aConvertIsoDates').iCheck('update')[0].checked;

    Meteor.call("updateMany", selectedCollection, selector, setObject, options, convertIds, convertDates, function (err, result) {
            Helper.renderAfterQueryExecution(err, result, false, "updateMany", params, (historyParams ? false : true));
        }
    );
};

const getOptions = function () {
    var result = {};

    if ($.inArray("UPSERT", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        var upsertVal = $('#divUpsert').iCheck('update')[0].checked;
        if (upsertVal) {
            result[Enums.UPDATE_OPTIONS.UPSERT] = upsertVal;
        }
    }

    return result;
};