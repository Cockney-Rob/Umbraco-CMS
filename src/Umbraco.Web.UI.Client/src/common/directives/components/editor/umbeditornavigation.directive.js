(function () {
    'use strict';

    function EditorNavigationDirective($window, $timeout, eventsService, windowResizeListener) {

        function link(scope) {

            scope.showNavigation = true;
            scope.showMoreButton = false;
            scope.showDropdown = false;
            scope.overflowingItems = 0;
            scope.itemsLimit = 6;

            scope.moreButton = {
                alias: "more",
                active: false,
                name: "More"
            };

            scope.openNavigationItem = item => {
                
                scope.showDropdown = false;
                runItemAction(item);
                setItemToActive(item);
                if (scope.onSelect) {
                    scope.onSelect({"item": item});
                }
                eventsService.emit("app.tabChange", item);
            };

            scope.openAnchorItem = (item, anchor) => {
                if (scope.onAnchorSelect) {
                    scope.onAnchorSelect({"item": item, "anchor": anchor});
                }
                if (item.active !== true) {
                    scope.openNavigationItem(item);
                }
            };

            scope.toggleDropdown = () => {
                scope.showDropdown = !scope.showDropdown;
            };

            scope.hideDropdown = () => {
                scope.showDropdown = false;
            };

            function onInit() {
                var firstRun = true;
                scope.$watch("navigation.length",
                    (newVal, oldVal) => {
                        if (firstRun || newVal !== undefined && newVal !== oldVal) {
                            firstRun = false;
                            scope.showNavigation = newVal > 1;
                            calculateVisibleItems($window.innerWidth);
                        }
                    });
            }

            function calculateVisibleItems(windowWidth) {

                // if we don't get a windowWidth stick with the default item limit
                if (!windowWidth) {
                    return;
                }

                scope.itemsLimit = 0;

                // set visible items based on browser width
                if (windowWidth > 1500) {
                    scope.itemsLimit = 6;
                } 
                else if (windowWidth > 700) {
                    scope.itemsLimit = 4;
                }

                // toggle more button
                if(scope.navigation.length > scope.itemsLimit) {
                    scope.showMoreButton = true;
                    scope.overflowingItems = scope.itemsLimit - scope.navigation.length;
                } else {
                    scope.showMoreButton = false;
                    scope.overflowingItems = 0;
                }
            }

            function runItemAction(selectedItem) {
                if (selectedItem.action) {
                    selectedItem.action(selectedItem);
                }
            }

            function setItemToActive(selectedItem) {
                if (selectedItem.view) {
                    
                    // deselect all items
                    Utilities.forEach(scope.navigation, item => {
                        item.active = false;
                    });
                    
                    // set clicked item to active
                    selectedItem.active = true;

                    // set more button to active if item in dropdown is clicked
                    var selectedItemIndex = scope.navigation.indexOf(selectedItem);
                    if (selectedItemIndex + 1 > scope.itemsLimit) {
                        scope.moreButton.active = true;
                    } else {
                        scope.moreButton.active = false;
                    }

                }
            }

            var resizeCallback = size => {
                if (size && size.width) {
                    calculateVisibleItems(size.width);
                }
            };

            windowResizeListener.register(resizeCallback);

            //ensure to unregister from all events and kill jquery plugins
            scope.$on('$destroy', function () {
                windowResizeListener.unregister(resizeCallback);
            });

            onInit();

        }

        var directive = {
            restrict: 'E',
            replace: true,
            templateUrl: 'views/components/editor/umb-editor-navigation.html',
            scope: {
                navigation: "=",
                onSelect: "&",
                onAnchorSelect: "&"
            },
            link: link
        };

        return directive;
    }

    angular.module('umbraco.directives.html').directive('umbEditorNavigation', EditorNavigationDirective);

})();
