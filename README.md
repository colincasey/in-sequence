# In-Sequence

A coroutines-style JavaScript library to execute and manage multiple asynchronous operations in a sequence without resorting to
spaghetti code.

### Download

Either clone this git repo or grab the source file directly from `public/in-sequence.js`.

### Usage

```javascript
var asyncFn = function(context) {
  context.data.count = (context.data.count || 0) + 1;
  setTimeout(context.complete, 100);
};

In.sequence(asyncFn, asyncFn, asyncFn, {
  success: function(context) {
    console.log("final count is: " + context.data.count);
  }
}).execute();
```