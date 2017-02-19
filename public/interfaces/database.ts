/**
 * Created by Derwish (derwish.pro@gmail.com) on 16.02.17.
 */

import {Container, SerializedContainer} from "../nodes/container";
import {Node, SerializedNode} from "../../public/nodes/node";
import {User} from "./user";


export interface Database {

    loadDatabase(callback?: (err: Error) => void);

    addNode(node: Node, callback?: (err?: Error, doc?: SerializedNode) => void);
    addUser(user: User, callback?: (err?: Error, doc?: User) => void);

    getNodes(callback?: (err?: Error, docs?: Array<SerializedNode>) => void);
    getUsers(callback?: (err?: Error, docs?: Array<User>) => void);

    getNode(id: number, cid: number, callback?: (err?: Error, doc?: SerializedNode) => void);
    getUser(name: string, callback?: (err?: Error, doc?: User) => void);

    updateNode(id: number, cid: number, update: any, callback?: (err?: Error) => void);

    getUsersCount(callback?: (err?: Error, num?: number) => void);

    dropUsers(callback?: (err?: Error) => void);
    dropNodes(callback?: (err?: Error) => void);
    dropApp(callback?: (err?: Error) => void);

    removeNode(id: number, cid: number, callback?: (err?: Error) => void);

    getLastContainerId(callback?: (err?: Error, id?: number) => void);
    updateLastContainerId(id: number, callback?: (err?: Error) => void);

    getLastRootNodeId(callback?: (err?: Error, id?: number) => void);
    updateLastRootNodeId(id: number, callback?: (err?: Error) => void);

}

