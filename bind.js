/*
    Two-Way binding with jQuery and Object.observe
    Author: Garrett
    
 
    *********** Notice *************
    You will need to be using a browser that
    supports Object.observe currently
    the only browser to do so is
    Chrome Canary V 29+
    
    You need to turn on Experimental JavaScript
    in chrome://flags
    
    ***********************************
    How to use it
    ***********************************
    To use this you would create one Object
    this object will house all of the keys
    you're going to want bound to a(n) element(s)
    on the page. In my example I have firstName
    and lastName. Then you would use the
    data-bind attribute on the element setting
    it's value equal to the key in the Object.
    You will need to run jQuery.bindings([bindings object]);
    It'll traverse the DOM and kick everything off for you.
 */

/* The Plugin */

;(function ( $, window, undefined ) {

  var pluginName = 'bindings';

  function Plugin( ele, data ) {
    this.bindings = data;
    this.el = $(ele);
    this._name = pluginName;
    this.doms = new Array();

    this.init();
  }

  Plugin.prototype.init = function () {
    var self = this;
  
    self.el.find('[data-bind]').each(function(){
      var $this = $(this);
      var key, filter, match;

      // extract key and filter function
      key = $this.attr('data-bind');
      match = /(\w+)\s*\|\s*(\w+)/g.exec(key);
      if ( match !== null ) {
        key = match[1];
        filter = match[2];  
      }

      self.doms.push({
          el: $this,
          key: key,
          filter: filter,
          hasVal: $this.is('select, options, input, textarea'),
          keyup: $this.is('input, textarea')
      });
    
      // Bind our Element to change the object
      // $this.on('keyup.bindings change.bindings', function(){
      //   self.bindings[key] = hasVal ? $this.val() : $this.html();
      //   $.trigger('bindings.'+key);
      // });      
    });

    $.each(self.doms, function(idx, dom){
        self.binder(dom, self.bindings[dom.key]);
    });

    Object.observe(self.bindings, function(obj){
        self.observer(obj);
    });
  };
  
  Plugin.prototype.binder = function (dom, val) {
    var filter = dom.filter
    , hasVal = dom.hasVal
    , el = dom.el;
    
    if ( filter in $.fn[pluginName].filters )
      val = $.fn[pluginName].filters[filter](val);
    el[hasVal?'val':'html'](val);
  };

  Plugin.prototype.observer = function (obj) {
      var self = this
      , name = obj[0].name
      , newValue = obj[0].object[name];
    
      $.each(self.doms, function(idx, dom) {
        if ( dom.key === name ) {
          self.binder(dom, newValue);
        }
      });
      
      // $.trigger('bindings.'+key);
  };

  // plugin enter point
  $.fn[pluginName] = function ( bindings ) {
    return this.each(function () {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new Plugin( this, bindings ));
        // console.log(this);
        // console.log($.data(this));
        // console.log($.fn[pluginName].filters);
      } else {
        delete $.data(this, 'plugin_'+pluginName);
        // console.log(this);
        $.data(this, 'plugin_' + pluginName, new Plugin( this, bindings ));
      }
    });
  };

  // Plugin filters holder
  $.fn[pluginName].filters = {};

}(jQuery, window));

