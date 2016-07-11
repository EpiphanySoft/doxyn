var gulp = require('gulp');
var jasmine = require('gulp-jasmine');
var reporters = require('jasmine-reporters');
var TerminalReporter = require('jasmine-terminal-reporter');
var Reporter = getReporterClass();

var reporterConfig = {
    includeStackTrace: true,
    isVerbose: false
};

gulp.task('default', function() {
    console.log('Default task');
});

gulp.task('test', function () {
    return gulp.src('test/**/*.js')
        .pipe(jasmine({
            reporter: new Reporter(reporterConfig)
        }));
});

function getReporterClass () {
    var teamCity = isTeamCity();

    if (teamCity) {
        console.log('Enable TeamCity');

        reporterConfig.print = data => {
            if (data !== '\n') { // not sure why output includes so many empty lines when errors are reported.
                process.stdout.write(data + '\n');
            }
        };

        return reporters.TeamCityReporter;
    }

    return TerminalReporter;
}

function isTeamCity () {
    return process.env.TEAMCITY_VERSION !== undefined;
}
