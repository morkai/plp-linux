define(["app/i18n","app/core/View","../views/LogInFormView"],function(e,i,n){"use strict";return i.extend({pageId:"logInForm",layoutName:"page",breadcrumbs:[e.bound("users","breadcrumbs:logIn")],initialize:function(){this.view=new n({model:this.model})}})});