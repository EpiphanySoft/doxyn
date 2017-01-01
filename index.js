const { Command, Container, Help } = require('switchit');

class Build extends Command {
    execute () {
        console.log('WIP');
    }
}

class Main extends Container {
    run () {
        console.log('Doxyn - Documentation Extractor');

        return super.run();
    }
}

Main.define({
    commands: [
        Build,
        Help
    ]
});

new Main().run().then(() => {},
e => {
    console.log(`ERR: `, e);
});
