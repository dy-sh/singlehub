/**
 * Created by Derwish (derwish.pro@gmail.com) on 16.02.17.
 */

import { Container, SerializedContainer } from "../nodes/container";
import { Node, SerializedNode } from "../../public/nodes/node";
import { UiPanel } from "../../modules/dashboard/ui-panel";
import { User } from "./user";


export interface Database {

    loadDatabase(callback?: (err: Error) => void);

    //insert
    addNode(node: Node, callback?: (err?: Error, doc?: SerializedNode) => void);
    addUiPanel(panel: UiPanel, callback?: (err?: Error, doc?: UiPanel) => void);
    addUser(user: User, callback?: (err?: Error, doc?: User) => void);

    //get
    getNodes(callback?: (err?: Error, docs?: Array<SerializedNode>) => void);
    getUiPanels(callback?: (err?: Error, docs?: Array<UiPanel>) => void);
    getUsers(callback?: (err?: Error, docs?: Array<User>) => void);
    getNode(id: number, cid: number, callback?: (err?: Error, doc?: SerializedNode) => void);
    getUiPanel(name: string, callback?: (err?: Error, doc?: UiPanel) => void);
    getUser(name: string, callback?: (err?: Error, doc?: User) => void);
    getUsersCount(callback?: (err?: Error, num?: number) => void);
    getLastContainerId(callback?: (err?: Error, id?: number) => void);
    getLastRootNodeId(callback?: (err?: Error, id?: number) => void);

    //update
    updateNode(id: number, cid: number, update: any, callback?: (err?: Error) => void);
    updateUiPanel(name: string, update: any, callback?: (err?: Error) => void);
    updateLastContainerId(id: number, callback?: (err?: Error) => void);
    updateLastRootNodeId(id: number, callback?: (err?: Error) => void);

    //remove
    removeNode(id: number, cid: number, callback?: (err?: Error) => void);
    removeUiPanel(name: string, callback?: (err?: Error) => void);

    //drop
    dropUsers(callback?: (err?: Error) => void);
    dropNodes(callback?: (err?: Error) => void);
    dropUiPanels(callback?: (err?: Error) => void);
    dropApp(callback?: (err?: Error) => void);



}

