module.exports = {
    extension: ['ts'],
    spec: 'src/**/*.test.ts',
    require: [
        'ts-node/register',
        'test/mocha.setup.ts'
    ],
    timeout: 5000,
    colors: true,
    recursive: true
};