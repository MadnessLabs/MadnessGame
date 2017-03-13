/// <reference path="../typings/index.d.ts"/>
module MadnessGame {
    'use strict';

    class AppRunner {
        constructor(
            $rootScope, 
            enjin, 
            $state, 
            $ionicLoading, 
            $ionicSideMenuDelegate,
            Platform
        ) {
            $rootScope.host = {
                api: enjin.db.api.host.slice(0, -3),
                apiFull: enjin.db.api.host,
                url: enjin.url
            };

            $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState) {
                $rootScope.showSidebar = true;
            });

            $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState) {
                $state.previous = fromState;
            });

            $rootScope.$on('loading:show', function() {
                $ionicLoading.show({ template: '<img src="./img/loader.gif" />' });
            });

            $rootScope.$on('loading:hide', function() {
                $ionicLoading.hide();
            });

            $rootScope.toggleMenu = function() {
                $ionicSideMenuDelegate.toggleLeft();
            };

            Platform.run();
        }
    }
    angular.module('MadnessGame').run(AppRunner);
}