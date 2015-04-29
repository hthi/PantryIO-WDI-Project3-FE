'use strict';

angular.module('PantryIO', [
  'ngAnimate',
  'ngResource',
  'ngRoute',
  'MainController',
  'MainDirective'
]).run(function($rootScope,$http,$window,$location,RecipesFactory, AuthFactory, ProfilesFactory){
  if(AuthFactory.isAuthenticated()){
    var data = JSON.parse($window.localStorage.getItem('ga-user'));
    $http.defaults.headers.common.Authorization = 'Token token='+data.user.token;
  } else {
    $location.path('/');
  }

  $rootScope.$on('$routeChangeStart',function(event,next){
    if(AuthFactory.isAuthenticated()){
      ProfilesFactory.getUser();
    }else{
    }
  });
});

'use strict';
angular.module('PantryIO').config(['$routeProvider', function($routeProvider){
  $routeProvider
    .when('/', {
      templateUrl: 'scripts/views/home.html',
      controller: 'HomeController'
    })
    .when('/login', {
      templateUrl: 'scripts/views/login.html'
    })
    .when('/profile', {
      templateUrl: 'scripts/views/profile.html',
      controller: 'ProfilesController',
      controllerAs: 'profilesController'
    })
    .when('/recipes', {
      templateUrl: 'scripts/views/recipes.html',
      controller: 'RecipesController',
      controllerAs: 'recipesController'
    })
    .when('/recipe-details', {
      templateUrl: 'scripts/views/recipe-details.html',
      controller: 'RecipesController',
      controllerAs: 'recipesController'
    })
    .when('/about', {
      templateUrl: 'scripts/views/about.html'
    })
    .otherwise({
      redirectTo: '/'
    });
}]);

'use strict'
//remember to leave off trailing slash on localhost
angular.module('PantryIO').constant('ServerUrl', 'https://limitless-plateau-6601.herokuapp.com');

'use strict';
angular.module('PantryIO').factory('RecipesFactory', ['$http', '$window', 'ServerUrl', function($http,$window,ServerUrl){

  var recipes = {};
  var array_ingredients = [];

  var getAllRecipes = function(ingredients){
    return $http.get(ServerUrl +'/food2fork').success(function(data){
      console.log(data);
      angular.copy(data, recipes);
    }).error(function(){
      console.log("error");
    });
  };

  var getRecipes = function(ingredients){
    console.log(ingredients);
    //create an array for all the ingredients entered into the search
    array_ingredients = ingredients.q.split(', ');
    console.log(array_ingredients);
    return $http.patch(ServerUrl +'/food2fork/1', ingredients).success(function(data){
      console.log(data);
      angular.copy(data, recipes);
    }).error(function(){
      console.log("error");
    });
  };

  var getOneRecipe = function(recipe_id){
    console.log("factory: trying to get a recipe");
    console.log(recipe_id);
    return $http.patch(ServerUrl +'/food2fork/2', recipe_id).success(function(data){
      console.log(data);
      angular.copy(data, recipes);
    }).error(function(){
      console.log("error");
    });
  };

  return {
    getAllRecipes: getAllRecipes,
    getRecipes: getRecipes,
    getOneRecipe: getOneRecipe,
    recipes: recipes,
    array_ingredients: array_ingredients
  };

}]);

//take each item from array of entered ingredients and compare to each item in the ingredient array generated from get request for the clicked on recipe
//see how many matches and get difference from total ingredients list length---this will be how many ingredients are left to get


'use strict'
angular.module('PantryIO').factory('AuthFactory', ['$http', '$window', 'ServerUrl', function($http,$window,ServerUrl){

  var login = function(credentials){
      console.log(credentials);
      return $http.post(ServerUrl + '/login', credentials).success(function(response){
        _storeSession(response);
      });
    };

    var logout = function(){
      return $http.get(ServerUrl + '/logout').success(function(response){
        $window.localStorage.removeItem('ga-user');
      });
    };

    var isAuthenticated = function(){
      var data = JSON.parse($window.localStorage.getItem('ga-user'));
      //only if data.token exists, return a boolean true
      //else return false---even if this statement does not evaluate
      if(data) return !!data.user.token;
      return false;
    };

    var clearStorage = function(){};

    var _storeSession = function(data){
      //setItem takes in a key and then the actual data to store
      $window.localStorage.setItem('ga-user', JSON.stringify(data));
      $http.defaults.headers.common.Authorization = 'Token token =' + data.token;
    };

    return {
      login: login,
      logout: logout,
      isAuthenticated: isAuthenticated,
      clearStorage: clearStorage
    };
}]);

'use strict'
angular.module('PantryIO').factory('ProfilesFactory', ['$http', '$window', 'ServerUrl', function($http,$window,ServerUrl){
  var user = {};
  var user_id;

  var getUser = function(){
    console.log("in factory get user");
    var data = JSON.parse($window.localStorage.getItem('ga-user'));
    user_id = data.user.id;
    var config = {
      headers: {
        'AUTHORIZATION': 'Token token=' + data.token
      }
    };

    return $http.get(ServerUrl +'/users/' + user_id, config).success(function(response){
      angular.copy(response, user);
      // debugger;
      console.log(response);
    }).error(function(data, status, headers, config){
      console.log('Youre doing it wrong: ', data, status, headers, config);
    });
  };

  return {
    user: user,
    getUser: getUser
  };
}]);

'use strict'
angular.module('MainController', []);

'use strict'
angular.module('MainController').controller('RecipesController', recipesController);

recipesController.$inject = ['RecipesFactory', '$location'];

function recipesController(RecipesFactory, $location){
  var vm = this;
  console.log("in recipesController");

  vm.loadAllRecipes = function(ingredients){
    RecipesFactory.getAllRecipes(ingredients).then(function(response){
      $location.path('/recipes');
    });
  };

  vm.searchRecipes = function(ingredients){
    console.log(ingredients);
    RecipesFactory.getRecipes(ingredients).then(function(response){
      $location.path('/recipes');
    });
  };

  vm.loadOneRecipe = function(recipe_id){
    console.log("in loadOneRecipe");
    console.log(recipe_id);
    recipe_id = {
      rId: recipe_id
    }
    console.log(recipe_id);
    RecipesFactory.getOneRecipe(recipe_id).then(function(response){
      vm.recipe_id = {};
      $location.path('/recipe-details');
    });
  };

  vm.recipes = RecipesFactory.recipes;
  vm.array_ingredients = RecipesFactory.array_ingredients;
}


'use strict'
angular.module('MainController').controller('LoginController', loginController);

loginController.$inject = ['AuthFactory', '$location'];

function loginController(AuthFactory, $location){
  var vm = this;

  vm.login = function(credentials){
    AuthFactory.login(credentials).then(function(response){
      vm.credentials = {};
      $location.path('/profile');
    });
  };
}

'use strict'
angular.module('MainController').controller('NavbarController', navbarController);

navbarController.$inject = ['AuthFactory', '$location'];

function navbarController(AuthFactory, $location){
  var vm = this;

  vm.isLoggedin = function(){
    return AuthFactory.isAuthenticated();
  };

  vm.logout = function(){
    AuthFactory.logout().then(function(){
      $location.path('/');
    });
  };
};

'use strict'

angular.module('MainController').controller('HomeController', homeController);

homeController.$inject = [];

function homeController(){

}

'use strict'
angular.module('MainController').controller('ProfilesController', profilesController);

profilesController.$inject= ['ProfilesFactory', '$routeParams'];

function profilesController(ProfilesFactory, $routeParams){
  var vm = this;

  vm.loadUser = function($routeParams){
    console.log("Printing routeParams");
    console.log($routeParams);
    ProfilesFactory.getUser($routeParams.userId).then(function(response){
      $location.path('/profile');
    });
  };

  vm.user = ProfilesFactory.user;
  console.log("The user is");
};

'use strict'
angular.module('MainDirective', []);

'use strict'

angular.module('MainDirective').directive('searchForm', [function(){
  return {
    restrict: 'E',
    templateUrl: 'views/recipes.html',
    controller: 'RecipesController',
    controllerAs: 'recipesController',
    bindToController: true,
    scope: {
      ingredients: '='
    }
  };

}]);

'use strict'
angular.module('MainDirective').directive('loginForm', [function(){
  return {
    //only want directive to be implemented as an element like <login-form></login-form>
    restrict: 'E',
    //html that the directive will mark-up
    templateUrl: 'scripts/views/login-form.html',
    controller: 'LoginController',
    controllerAs: 'loginController',
    //all the attributes going into the directive need to be bound to the controller
    bindToController: true,
    scope: {
      credentials: '='
    }
  };
}]);

'use strict'
angular.module('MainDirective').directive('gaNavbar', [function(){
  return {
    restrict: 'E',
    templateUrl: 'scripts/views/partials/navbar.html',
    controller: 'NavbarController',
    controllerAs: 'navbarController',
    bindToController: true,
    scope: {},
    link: function($scope,element,attrs){
      //manipulate the dom here.
    }
  };
}]);
