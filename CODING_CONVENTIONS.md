
* member variables - '_name'
* calling methods: prefer 'obj.func()' over 'obj['func']()'
* class annd interface names: don't use 'Logger' inherits from 'ILogger'. use 'WinstonLogger' (or any other implementation) inherits from 'Logger'.
* function Names: camel case - 'funcName'
* local variables (also const): camel case - 'varName'
* function declarations - prefer 'func() {...}'  over 'const func = ()=>{}'
* literal values should be declared in a const variable. for example: 'const connectionPort: number = 1000'