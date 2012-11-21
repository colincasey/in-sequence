require('/in-sequence.js');

describe('sequence', function() {
  it("should have an 'isSequence' property equal to true", function() {
    var seq = In.sequence();
    expect(seq.isSequence).toEqual(true);
	});

	it("should have an execute method", function() {
    var seq = In.sequence();
    expect(typeof seq.execute).toEqual('function');
	});

  it("should execute a number of asynchronous functions in sequence", function() {
    var asyncFn = function(context) {
      context.data.count = (context.data.count || 0) + 1;
      setTimeout(context.complete, 100);
    };

    var seq = In.sequence(asyncFn, asyncFn, asyncFn);
    var expectation = function() {
      expect(seq.context.data.count).toEqual(3);
    };

    runs(seq.execute);
    waitsFor(seq.isComplete, 1000);
    runs(expectation);
  });

  it("should allow for cancellation of execution", function() {
    var asyncFn = function(context) {
      context.data.count = (context.data.count || 0) + 1;
      setTimeout(context.complete, 100);
    };

    var cancelledFn = function(context) {
      context.cancel();
    };

    var seq = In.sequence(asyncFn, asyncFn, cancelledFn, asyncFn);
    var expectation = function() {
      expect(seq.context.data.count).toEqual(2);
      expect(seq.wasCancelled()).toEqual(true);
    };

    runs(seq.execute);
    waitsFor(seq.isComplete, 1000);
    runs(expectation);
  });

  it("should be able to pass arguments to subsequent operations in the sequence", function() {
    var seq = In.sequence(function(context) {
      context.complete(1, 2, 3);
    }, function(context, a, b, c) {
      expect(a).toEqual(1);
      expect(b).toEqual(2);
      expect(c).toEqual(3);
      context.complete(c, 4, 5);
    }, function(context, c, d, e) {
      expect(c).toEqual(3);
      expect(d).toEqual(4);
      expect(e).toEqual(5);
      context.complete();
    });

    runs(seq.execute);
    waitsFor(seq.isComplete, 1000);
  });

  it("should be able to pass arguments to the error callback for the sequence", function() {
    var seq = In.sequence(function(context) {
      context.cancel('i had to cancel', 1, 2);
    }, {
      error: function(context, message, a, b) {
        expect(message).toEqual('i had to cancel');
        expect(a).toEqual(1);
        expect(b).toEqual(2);
      }
    });

    runs(seq.execute);
    waitsFor(seq.isComplete, 1000);
  });

  it("should be able to pass arguments to the success callback for the sequence", function() {
    var seq = In.sequence(function(context) {
      context.complete(1, 2);
    }, {
      success: function(context, a, b) {
        expect(a).toEqual(1);
        expect(b).toEqual(2); 
      }
    });

    runs(seq.execute);
    waitsFor(seq.isComplete, 1000);
  });
});