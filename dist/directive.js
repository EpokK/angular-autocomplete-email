/*!
 * angular-directive-boilerplate
 * 
 * Version: 0.0.8 - 2015-03-30T20:43:50.254Z
 * License: MIT
 */


'use strict';

angular.module('angular-autocomplete-email', [])
.filter('autocompleteFilter', function() {
    return function(autocomplete, value) {
        var result = [];

        // filter
        if(value && value.length > 0) {
            for (var i = autocomplete.length - 1; i >= 0; i--) {
                var email = autocomplete[i];

                if(typeof email.value !== 'undefined') {
                    if((email.value.toLowerCase()).indexOf((value.toLowerCase())) !== -1 || (email.label.toLowerCase()).indexOf((value.toLowerCase())) !== -1) {
                        result.push(email);
                    }
                }
            }
        }

        // sort
        result.sort(function(a, b) {
            return ((a.label.toLowerCase()).score(value) + (a.value.toLowerCase()).score(value)) < ((b.label.toLowerCase()).score(value) + (b.value.toLowerCase()).score(value));
        });

        return result;
    };
})
.directive('autocompleteEmail', function ($timeout, $filter) {

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

    var matchEmail = function(value) {
        var emails = [];
        var result = value.match(regexEmail);

        if(result) {
            emails = result;
        } else {
            emails = [];
        }

        return emails;
    };

    var getEmails = function(value, emails, index) {
        var values = matchEmail(value);

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
        scope: {
            emails: '=',
            autocomplete: '='
        },
        link: function (scope, element, attrs) {
            scope.params = {
                newValue: '',
                autocompleteFiltered: [],
                selected: null
            };

            scope.onSubmit = function(email) {
                var index = scope.emails.indexOf(email);
                var newValue = angular.copy(scope.params.newValue);
                var length = scope.emails.length;
                var emails = getEmails(newValue, scope.emails, index);

                if(emails.length) {
                    scope.emails = emails;
                } else {
                    scope.params.newValue = '';
                    scope.onRemove(scope.emails.indexOf(email));
                }
            };

            scope.selectFirstAutocomplete = function() {

            };

            scope.onBlur = function(email) {
                var emails = matchEmail(scope.params.newValue);

                if(emails.length > 0) {
                    if(scope.params.selected !== null) {
                        scope.onAddEmail(scope.params.autocompleteFiltered[scope.params.selected]);
                        scope.onRemove(scope.emails.indexOf(email));
                    } else {
                        scope.onSubmit(email, false);
                    }
                } else {
                    scope.onRemove(scope.emails.indexOf(email));
                }

                scope.createNewInput();
            };

            scope.onEdit = function(email) {
                email.edit = true;
                scope.params.newValue = angular.copy(email.value);
            };

            scope.onRemove = function(index) {
                scope.emails.splice(index, 1);
            };

            scope.onMouseDown = function(event) {
                scope.onClick(event);
            };

            scope.createNewInput = function() {
                $timeout(function() {
                    var input = scope.getLastInput();

                    scope.params.newValue = '';

                    if(!angular.isDefined(input)) {
                        scope.emails.push({
                            value: '',
                            label: '',
                            edit: true
                        });
                    }

                    scope.focusLastInput();
                });
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
                scope.params.newValue = '';
                scope.onChange();
            };

            scope.onClose = function() {
                scope.params.selected = null;
            };

            scope.onOpen = function() {
                scope.params.selected = 0;
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

            scope.onChange = function() {
                scope.params.autocompleteFiltered = $filter('autocompleteFilter')(scope.autocomplete, scope.params.newValue);

                if(scope.params.autocompleteFiltered.length > 0) {
                    scope.onOpen();
                } else {
                    scope.onClose();
                }
            };

            scope.onKeyDown = function(event, email) {
                switch (event.keyCode) {
                    case BACKSPACE_KEY:
                        var value = scope.params.newValue;
                        var emails = scope.emails;

                        if(value.length === 0 && emails.length > 0) {
                            this.onRemove(emails.length - 2);
                        }
                        break;
                    case DOWN_KEY:
                    case UP_KEY:
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
                        if(scope.params.selected !== null) {
                            scope.onAddEmail(scope.params.autocompleteFiltered[scope.params.selected]);
                            scope.onRemove(scope.emails.indexOf(email));
                        } else {
                            scope.onSubmit(email, true);
                        }

                        scope.createNewInput();
                        break;
                    case DOWN_KEY:
                        if(scope.params.autocompleteFiltered.length > 0) {
                            if(scope.params.selected === null) {
                                 scope.params.selected = 0;
                            } else if(scope.params.autocompleteFiltered.length > 0 && scope.params.selected < scope.params.autocompleteFiltered.length - 1) {
                                  scope.params.selected++;
                            }
                        }
                        break;
                    case UP_KEY:
                        if(scope.params.autocompleteFiltered.length > 0) {
                            if(scope.params.selected > 1) {
                                scope.params.selected--;
                            } else {
                                scope.params.selected = 0;
                            }
                        }
                        break;
                    default:
                        break;
                }
            };

        }
    };
});

angular.module("angular-autocomplete-email").run(["$templateCache", function($templateCache) {$templateCache.put("input.html","<div class=\"container-email\"><div class=\"input-email\" ng-mousedown=\"onMouseDown($event)\"><span ng-repeat=\"email in emails\" class=\"email\"><span class=\"label-email\" ng-attr-title=\"{{email.value}}\" ng-dblclick=\"onEdit(email)\" ng-if=\"!!!email.edit\"><span>{{email.label}}</span> <a ng-click=\"onRemove($index)\">x</a></span><form class=\"form-email\" ng-submit=\"onSubmit(email, true)\" ng-if=\"!!email.edit\"><input class=\"edit-email\" type=\"text\" ng-model=\"params.newValue\" ng-blur=\"onBlur(email)\" ng-keydown=\"onKeyDown($event, email)\" ng-keyup=\"onKeyUp($event, email)\" ng-change=\"onChange()\"></form></span></div><ul class=\"autocomplete-email\" ng-if=\"params.autocompleteFiltered.length\"><li ng-repeat=\"email in params.autocompleteFiltered\"><a href=\"\" ng-mousedown=\"onAddEmail(email)\" ng-class=\"{\'selected\': $index === params.selected}\">{{email.value}}</a></li></ul><br><br>{{emails|json}}<br>{{params.newValue|json}}</div>");}]);