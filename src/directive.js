'use strict';

angular.module('angular-autocomplete-email', [])
.directive('autocompleteEmail', function () {

    var regexEmail = /([.^\S]+@[.^\S]+\.[.^\S]+)/gi;

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

    var getEmails = function(value) {
        var values = value.match(regexEmail);
        var emails = [];

        if(values) {
            var tempValue = value;

            for (var i = 0; i < values.length; i++) {
                if(tempValue) {
                    var email = clean(values[i]);
                    var arrayValue = tempValue.split(email);

                    emails.push({
                        value: buildValue(arrayValue[0], email),
                        label: buildLabel(arrayValue[0], email),
                        edit: false
                    });

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
                var newValue = angular.copy(email.newValue);
                var emails = getEmails(newValue);

                if(emails.length) {
                    scope.emails = emails;
                } else {
                    scope.onRemove(scope.emails.indexOf(email));
                }
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

            scope.onClick = function(event) {
                scope.emails.push({
                    value: '',
                    label: '',
                    newValue: '',
                    edit: true
                });
            };

        }
    };
});
