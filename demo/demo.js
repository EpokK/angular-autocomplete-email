var app = angular.module('demo', ['ngSanitize', 'angular-autocomplete-email']);

app.controller('main', function($scope) {

    $scope.autocomplete = [
        {value: 'Aude <aude@gmail.com>', label: 'Aude'},
        {value: 'Richard <richard@gmail.com>', label: 'Richard'},
        {value: 'Guillaume <guillaume@gmail.com>', label: 'Guillaume'}
    ];

    $scope.emails = [
        {value: 'Richard <richard@gmail.com>', label: 'Richard'}
    ];

    $scope.remove = function() {
        $scope.emails.pop();
    };
});
