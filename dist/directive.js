/*!
 * angular-directive-boilerplate
 * 
 * Version: 0.0.8 - 2015-03-27T21:05:36.640Z
 * License: MIT
 */


'use strict';

angular.module('angular-autocomplete-email', [])
.filter('autocompleteFilter', function() {
    return function(emails, value) {
        return emails;
    };
})
.directive('autocompleteEmail', function ($timeout) {

    var regexEmail = /([.^\S]+@[.^\S]+\.[.^\S]+)/gi;

    var TAB_KEY = 9;
    var ENTER_KEY = 13;
    var BACKSPACE_KEY = 8;
    var UP_KEY = 38;
    var DOWN_KEY = 40;
    var ESC_KEY = 27;
    var SPACE_KEY = 32;

    var buildLabel = function(label, value) {
        var result;

        if (label.length > 0) {
            result = label;
        } else {
            result = value;
        }

        return result;
    };

    var buildValue = function(label, value) {
        var result;

        if (label.length > 0) {
            result = label + ' <' + value + '>';
        } else {
            result = value;
        }

        return result;
    };

    var clean = function(value) {
        return value
            .replace(/</g, '')
            .replace(/>/g, '')
            .replace(/"/g, '')
            .replace(/'/g, '')
            .replace(/,/g, '')
            .trim();
    };

    var getEmails = function(value, emails, index) {
        var values = value.match(regexEmail);
        emails = emails || [];

        if(values) {
            var tempValue = value;

            for (var i = 0; i < values.length; i++) {
                if(tempValue) {
                    var email = clean(values[i]);
                    var arrayValue = tempValue.split(email);
                    var label = clean(arrayValue[0]);
                    var build = {
                        value: buildValue(label, email),
                        label: buildLabel(label, email),
                        edit: false
                    };

                    if(i === 0 && index >= 0) {
                        emails[index] = build;
                    } else {
                        emails.push(build);
                    }

                    tempValue = arrayValue[1];
                }
            }
        }

        return emails;
    };

    var highlight = function(string, word) {
		var regex = new RegExp('(' + word + ')', 'gi');
		return string.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(regex, "<span class='highlight'>$1</span>");
	};

    return {
        restrict: 'EA',
        templateUrl: '../src/input.html',
        replace: true,
        scope: false,
        link: function (scope, element, attrs) {

            scope.onSubmit = function(email) {
                var index = scope.emails.indexOf(email);
                var newValue = angular.copy(email.newValue);
                var emails = getEmails(newValue, scope.emails, index);

                if(emails.length) {
                    scope.emails = emails;
                } else {
                    scope.onRemove(scope.emails.indexOf(email));
                }

                scope.createNewInput();
            };

            scope.onBlur = function(email) {
                scope.onSubmit(email);
            };

            scope.onEdit = function(email) {
                email.edit = true;
                email.newValue = angular.copy(email.value);
            };

            scope.onRemove = function(index) {
                scope.emails.splice(index, 1);
            };

            scope.onMouseDown = function(event) {
                scope.onClick(event);
            };

            scope.createNewInput = function() {
                var input = scope.getLastInput();

                if(!angular.isDefined(input)) {
                    scope.emails.push({
                        value: '',
                        label: '',
                        newValue: '',
                        edit: true
                    });
                }

                scope.focusLastInput();
            };

            scope.onClick = function(event) {
                if(event.target == element[0].firstElementChild) {
                    scope.createNewInput();
                }
            };

            scope.onAddEmail = function(email) {
                scope.emails.push({
                    value: email.value,
                    label: email.label,
                    edit: false
                });
            };

            scope.onClose = function() {

            };

            scope.getLastInput = function() {
                var inputs = element.find('input');
                var length = inputs.length;

                return inputs[length - 1];
            };

            scope.focusLastInput = function() {
                $timeout(function() {
                    var input = scope.getLastInput();

                    if(input) {
                        scope.getLastInput().focus();
                    }
                }, 200);
            };

            scope.onChange = function(email) {
                scope.newValue = email.newValue;
            };

            scope.onKeyDown = function(event, email) {
                switch (event.keyCode) {
                    case BACKSPACE_KEY:
                        var value = email.newValue;
                        var emails = scope.emails;

                        if(value.length === 0 && emails.length > 0) {
                            this.onRemove(emails.length - 2);
                        }
                        break;
                    case TAB_KEY:
                    case ENTER_KEY:
                        event.preventDefault();
                        event.stopPropagation();
                        break;
                    default:
                        break;
                }
            };

            scope.onKeyUp = function(event, email) {
                switch (event.keyCode) {
                    case ENTER_KEY:
                    case TAB_KEY:
                        scope.onSubmit(email);
                        break;
                    default:
                        break;
                }
            };

        }
    };
});

angular.module("angular-autocomplete-email").run(["$templateCache", function($templateCache) {$templateCache.put("input.html","<div><div class=\"input-email\" ng-mousedown=\"onMouseDown($event)\"><span ng-repeat=\"email in emails\"><span class=\"label-email\" ng-attr-title=\"{{email.value}}\" ng-dblclick=\"onEdit(email)\" ng-if=\"!!!email.edit\"><span>{{email.label}}</span> <a ng-click=\"onRemove($index)\">x</a></span><form class=\"form-email\" ng-submit=\"onSubmit(email)\" ng-if=\"!!email.edit\"><input class=\"edit-email\" type=\"text\" ng-model=\"email.newValue\" ng-blur=\"onBlur(email)\" ng-keydown=\"onKeyDown($event, email)\" ng-keyup=\"onKeyUp($event, email)\" ng-change=\"onChange(email)\"></form></span></div><ul class=\"autocomplete-email\"><li ng-repeat=\"email in autocomplete | autocompleteFilter:newValue\"><a href=\"\" ng-click=\"onAddEmail(email)\">{{email.value}}</a></li></ul></div>");}]);