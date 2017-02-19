/**
 * Created by Derwish (derwish.pro@gmail.com) on 16.02.17.
 */

import {Container, SerializedContainer} from "../nodes/container";
import {Node, SerializedNode} from "../../public/nodes/node";



export interface Database {

    loadDatabase(callback?: (err: Error) => void);

    addContainer(c: Container, callback?: (err?: Error, doc?: SerializedContainer) => void);
    addNode(node: Node, callback?: (err?: Error, doc?: SerializedNode) => void);

    getContainers(callback?: (err?: Error, docs?: Array<SerializedContainer>) => void) ;
    getNodes(callback?: (err?: Error, docs?: Array<SerializedNode>) => void);

    getContainer(id: number, callback?: (err?: Error, doc?: SerializedContainer) => void) ;
    getNode(id: number, cid: number, callback?: (err?: Error, doc?: SerializedNode) => void) ;

    updateContainer(id: number, update: any, callback?: (err?: Error) => void) ;
    updateNode(id: number, cid: number, update: any, callback?: (err?: Error) => void) ;
}

