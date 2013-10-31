var currentWindowOnload = window.onload;
window.onload = function() {
    if (currentWindowOnload) {
        currentWindowOnload();
    }
    
    var jasmineEnv = jasmine.getEnv(),
    htmlReporter = new jasmine.HtmlReporter();
    // jasmineEnv.addReporter(new jasmine.TapReporter());
    // jasmineEnv.addReporter(new jasmine.TrivialReporter());
    jasmineEnv.addReporter(htmlReporter);

    jasmineEnv.specFilter = function(spec) {
        return htmlReporter.specFilter(spec);
    };

    jasmineEnv.execute();
};