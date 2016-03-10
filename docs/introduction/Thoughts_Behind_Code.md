# Thoughts Behind Code

As we mentioned before, the idea is pretty simple. But still there are  lots of thoughts behind it. I will try to explain three important here.

The first is that using **promise** to wrap single asynchronous action( we call it task ) and using **generator** to wrap multiple tasks is a great idea. In this way, your code will be synchronous, easy to read and test. This was learned from redux-sage, a great side effects middleware.

Second, we separate task and `dispatch` explicitly. We use `yield` to execute tasks, `emit` to execute a listener, and `dispatch` are strongly recommend only exist in listeners. So you will be pretty sure when will the store changes and thus when will the view changes.

The third is **serial as default**. When naming the task you may wonder, what if the task is not finished, and the same event which will trigger the task emitted again? Would we have two task running with the same name? The answer is no, actually redux-task will throw a error in this condition. In my experience, event being emitted without control are always prone to bugs. Imagine a login form can be submitted without any limit. So if you really have a task can be parallel running, you need to explicitly  use  `nameGroup` method to wrap your task. This explicit usage will always remind you in the code about the parallel situation you are dealing with.