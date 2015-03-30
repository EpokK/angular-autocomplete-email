var app = angular.module('demo', ['ngSanitize', 'angular-autocomplete-email']);

app.controller('main', function($scope) {

    $scope.autocomplete = [
        {value: 'Aude <aude@gmail.com>', label: 'Aude'},
        {value: 'Richard <richard@gmail.com>', label: 'Richard'},
        {value: 'Guillaume <guillaume@gmail.com>', label: 'Guillaume'},
        {value: 'Axelle <axelle@gmail.com>', label: 'Axelle'}
    ];

    $scope.emails1 = [
        {value: 'Richard <richard@gmail.com>', label: 'Richard'}
    ];
});
