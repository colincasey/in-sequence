(function() {	
  var global = this;
  var slice = Array.prototype.slice;

  var In = {};
  if(typeof module !== 'undefined' && module.exports) {
    module.exports = In;
  } else {
    global.In = In;
  }

  var newSequence = function(functions, options) {
    var isComplete = false;
    var wasCancelled = false;
    var executor = createSequenceExecutor(functions, options,
      function() { isComplete = true; },
      function() { isComplete = true; wasCancelled = true; }
    );
    
    var seq = function() { executor.run(); };
    seq.execute = function() { executor.run(); };
    seq.isComplete = function() { return isComplete; };
    seq.wasCancelled = function() { return wasCancelled; };
    seq.context = executor.context;
    seq.isSequence = true;

    return seq;
  };

  var createSequenceExecutor = function(functions, options, onComplete, onCancel) {
    var currentStep = 0;
    var data = options.data || {};
    var success = options.success || function() {};
    var error = options.error || function() {};

    var argsWithContext = function(args) {      
      var args = slice.call(args || []);
      args.unshift(context);
      return args;
    };

    var context = {
      data: data,
      complete: function() {
        currentStep = currentStep + 1;
        if(currentStep !== functions.length) {
          executeStep(currentStep, arguments);
        } else {
          onComplete();
          success.apply(scope, argsWithContext(arguments));  
        }
      },
      cancel: function(msg) {
        onCancel();
        error.apply(scope, argsWithContext(arguments));
      }
    };

    var scope = options.scope || context;

    var executeStep = function(i, args) {
      var fn = functions[i];
      fn.apply(scope, argsWithContext(args));
    };

    return { 
      run: function() { executeStep(0); },
      context: context 
    };
  };

	In.sequence = function() {
		var args = slice.call(arguments);
    var options = {};
    if(typeof args[args.length - 1] === 'object') {
      options = args.pop();
    }
    return newSequence(args, options);
	};

})();