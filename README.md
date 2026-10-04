
# Error Handling

Error handling has been wrong since the beginning, and has continued to be wrong ever since.

First, we had error codes. Except these were wrong because people forget all the time to check them.

Then we had exceptions, which solved the problem of people forgetting to check by crashing the app.

Then the Java team got the bright idea to have checked exceptions, which at first helped to mitigate crashes
from uncaught exception, but caused an explosion in thrown exception signatures, culminating in "catch Throwable".

Back to square one.

Then we got multi-return error objects, maybes, panics, and all sorts of bright ideas that fail to understand the basic premises of errors:

  Any error system that relies upon developer discipline will fail because errors will be missed.

  Any error system that handles all errors the same way will fail because there are some errors we can ignore,
  and some errors we must not ignore. And what's ignorable/retriable to one project is not ignorable/retriable to another.

Attempting to get the complete set of error types that any given call may raise is a fool's errand because of the halting 
problem it eventually invokes. Forcing people to provide such a list results in the Java problem for the same reason.

It's a hard problem, which is why no one has solved it yet. 