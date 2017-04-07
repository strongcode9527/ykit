'use strict';

const webpack = require('webpack');

module.exports = function(config) {

    config = handleLoaders(config);
	config = handleMigrationConfig(config);
    config = handleNotAllowedConfig(config);

    return config;
};

function handleLoaders(config) {
    const preLoaders = config.module.preLoaders.map((loader) => {
        loader.enforce = 'pre';
        return loader;
    });

    const postLoaders = config.module.postLoaders.map((loader) => {
        loader.enforce = 'post';
        return loader;
    });

    config.module.loaders = preLoaders.concat(config.module.loaders, postLoaders);

    config.module.loaders = config.module.loaders.map((loader) => {
        if (loader.loader && loader.loaders) {
            logWarn('Provided loader and loaders for rule (use only one of them):');
            info(JSON.stringify(loader, null, 4).yellow + '\n');
            delete loader.loader;
        }
        return loader;
    });

    config.plugins.push(new webpack.LoaderOptionsPlugin({
        options: {
            fekitDomainMappingList: config.fekitDomainMappingList,
            sync: config.sync,
            envParams: config.envParams,
            projectCwd: config.projectCwd,
            resolve: config.resolve,

            // fix sassLoader webpack2 error: https://github.com/webpack-contrib/sass-loader/issues/285
            sassLoader: {
                includePaths: [sysPath.resolve(__dirname, 'src', 'scss')]
            },
            context: '/'
        }
    }));

    delete config.module.preLoaders;
    delete config.module.postLoaders;

    return config;
}

function handleMigrationConfig(config) {
    return config;
}

function handleNotAllowedConfig(config) {
    const removeConfigNames = [
        'cwd',
        'sync',
        'projectCwd',
        'envParams',
        'fekitDomainMappingList',
        'requireRules',
        'entryExtNames',
        'getVendor'
    ];
    removeConfigNames.map((configName) => {
        delete config[configName];
    });

    return config;
}
