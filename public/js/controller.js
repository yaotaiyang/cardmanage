/**
 * Created by yaoxy on 2015/11/2.
 */
define(function(require,exports,module){
    require("angular");
    require("lean-clound");
    require("directive");
    require("service");
    var app = angular.module('appController', ['appService','appDirective']);
    app.controller('Index',['$scope','$rootScope','cardService',function($scope,$rootScope,cardService) {
        $scope.name = "yaotaiyang";
        $rootScope.pageTitle="卡片管理系统";
        cardService.getData({
            success:function(){
                $scope.list=tplData.cardList;
                $scope.$apply();
            }
        });
    }]);
    app.controller('Modefycard',['$scope','$routeParams','cardService',function($scope,$routeParams,cardService){
        if(tplData.leanClound[$routeParams.id]){
            $scope.formData = tplData.leanClound[$routeParams.id].attributes;
        }else{
            cardService.getData({
                success:function(){
                    $scope.formData = tplData.leanClound[$routeParams.id].attributes;
                    $scope.$apply();
                },error:function(){}
            });
        }
        $scope.addForm=function(){
            cardService.update({
                data:$scope.formData,
                success:function(data){
                    alert("保存成功");
                },
                error:function(data){}
            });
        }
    }]);
    app.controller('Addcard',['$scope','$routeParams','cardService',function($scope,$routeParams,cardService){
        $scope.addForm=function(){
            cardService.insert({
                data:$scope.formData,
                success:function(data){
                    alert("新增成功");
                },
                error:function(data){

                }
            });
        }
    }]);
    app.controller('List',['$scope',function($scope) {
        $scope.name = "taiyang";
    }]);
    app.controller('Manage',['$scope','$rootScope',function($scope,$rootScope) {
        $scope.name = "taiyang";
        $rootScope.pageTitle="管理";
    }]);
    app.controller('Login',['$scope','$rootScope',function($scope,$rootScope) {
        $rootScope.pageTitle="登录";
        $scope.addForm=function(){
            console.log($scope);
            AV.User.logIn($scope.name,$scope.password, {
                success: function(user) {
                    location.href="#/index";
                },
                error: function(user, error) {
                    alert(error.message);
                }
            });
        }
    }]);
});