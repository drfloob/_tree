var currentWindowOnload = window.onload;
window.onload = function() {
    if (currentWindowOnload) {
        currentWindowOnload();
    }
    
    var jasmineEnv = jasmine.getEnv();
    // jasmineEnv.addReporter(new jasmine.TapReporter());
    // jasmineEnv.addReporter(new jasmine.TrivialReporter());
    jasmineEnv.addReporter(new jasmine.HtmlReporter());
    jasmineEnv.execute();
};