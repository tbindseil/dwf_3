import {
    GetPicturesInput,
    GetPicturesOutput
} from 'dwf-3-models-tjb';
import API from './api';
import * as db from '../db';


export class GetPictures extends API {
    constructor() {
        super('GET', 'pictures');
    }

    public get_input(req: any): GetPicturesInput {
        console.log('GetPictures.get_input');
        req;

        // temporary, test out db connection
        const query = 'SELECTy * from test_auto_increment where id = $1';
        const params = ['2'];
        db.query(query, params, (err: any, result: any) => {
            console.log(`err is ${err}`);
            console.log(`result is ${JSON.stringify(result)}`);

            // if (err) { throw new Error('error getting pictures'); }
        });

            /*
GET request received at /pictures
GetPictures.get_input
query is: function query(text, params, callback) {
    console.log("query is: ".concat(query));
    console.log("params are: ".concat(params));
    return pool.query(text, params, callback);
}
params are: 1
GetPictures.process
err is undefined
result is {"command":"SELECT","rowCount":1,"oid":null,"rows":[{"id":1,"name":"test_name"}],"fields":[{"name":"id","tableID":24588,"columnID":1,"dataTypeID":23,"dataTypeSize":4,"dataTypeModifier":-1,"format":"text"},{"name":"name","tableID":24588,"columnID":2,"dataTypeID":1043,"dataTypeSize":-1,"dataTypeModifier":-1,"format":"text"}],"_parsers":[null,null],"_types":{"_types":{"arrayParser":{},"builtins":{"BOOL":16,"BYTEA":17,"CHAR":18,"INT8":20,"INT2":21,"INT4":23,"REGPROC":24,"TEXT":25,"OID":26,"TID":27,"XID":28,"CID":29,"JSON":114,"XML":142,"PG_NODE_TREE":194,"SMGR":210,"PATH":602,"POLYGON":604,"CIDR":650,"FLOAT4":700,"FLOAT8":701,"ABSTIME":702,"RELTIME":703,"TINTERVAL":704,"CIRCLE":718,"MACADDR8":774,"MONEY":790,"MACADDR":829,"INET":869,"ACLITEM":1033,"BPCHAR":1042,"VARCHAR":1043,"DATE":1082,"TIME":1083,"TIMESTAMP":1114,"TIMESTAMPTZ":1184,"INTERVAL":1186,"TIMETZ":1266,"BIT":1560,"VARBIT":1562,"NUMERIC":1700,"REFCURSOR":1790,"REGPROCEDURE":2202,"REGOPER":2203,"REGOPERATOR":2204,"REGCLASS":2205,"REGTYPE":2206,"UUID":2950,"TXID_SNAPSHOT":2970,"PG_LSN":3220,"PG_NDISTINCT":3361,"PG_DEPENDENCIES":3402,"TSVECTOR":3614,"TSQUERY":3615,"GTSVECTOR":3642,"REGCONFIG":3734,"REGDICTIONARY":3769,"JSONB":3802,"REGNAMESPACE":4089,"REGROLE":4096}},"text":{},"binary":{}},"RowCtor":null,"rowAsArray":false}
        */

        return {};
    }

    public process(input: GetPicturesInput): GetPicturesOutput {
        console.log('GetPictures.process');
        input;
        return {
            msg: 'all pictures'
        }
    }
}
