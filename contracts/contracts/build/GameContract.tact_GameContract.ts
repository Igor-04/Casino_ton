import {
    Cell,
    Slice,
    Address,
    Builder,
    beginCell,
    ComputeError,
    TupleItem,
    TupleReader,
    Dictionary,
    contractAddress,
    address,
    ContractProvider,
    Sender,
    Contract,
    ContractABI,
    ABIType,
    ABIGetter,
    ABIReceiver,
    TupleBuilder,
    DictionaryValue
} from '@ton/core';

export type DataSize = {
    $$type: 'DataSize';
    cells: bigint;
    bits: bigint;
    refs: bigint;
}

export function storeDataSize(src: DataSize) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.cells, 257);
        b_0.storeInt(src.bits, 257);
        b_0.storeInt(src.refs, 257);
    };
}

export function loadDataSize(slice: Slice) {
    const sc_0 = slice;
    const _cells = sc_0.loadIntBig(257);
    const _bits = sc_0.loadIntBig(257);
    const _refs = sc_0.loadIntBig(257);
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadGetterTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function storeTupleDataSize(source: DataSize) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.cells);
    builder.writeNumber(source.bits);
    builder.writeNumber(source.refs);
    return builder.build();
}

export function dictValueParserDataSize(): DictionaryValue<DataSize> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDataSize(src)).endCell());
        },
        parse: (src) => {
            return loadDataSize(src.loadRef().beginParse());
        }
    }
}

export type SignedBundle = {
    $$type: 'SignedBundle';
    signature: Buffer;
    signedData: Slice;
}

export function storeSignedBundle(src: SignedBundle) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBuffer(src.signature);
        b_0.storeBuilder(src.signedData.asBuilder());
    };
}

export function loadSignedBundle(slice: Slice) {
    const sc_0 = slice;
    const _signature = sc_0.loadBuffer(64);
    const _signedData = sc_0;
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadGetterTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function storeTupleSignedBundle(source: SignedBundle) {
    const builder = new TupleBuilder();
    builder.writeBuffer(source.signature);
    builder.writeSlice(source.signedData.asCell());
    return builder.build();
}

export function dictValueParserSignedBundle(): DictionaryValue<SignedBundle> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSignedBundle(src)).endCell());
        },
        parse: (src) => {
            return loadSignedBundle(src.loadRef().beginParse());
        }
    }
}

export type StateInit = {
    $$type: 'StateInit';
    code: Cell;
    data: Cell;
}

export function storeStateInit(src: StateInit) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeRef(src.code);
        b_0.storeRef(src.data);
    };
}

export function loadStateInit(slice: Slice) {
    const sc_0 = slice;
    const _code = sc_0.loadRef();
    const _data = sc_0.loadRef();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadGetterTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function storeTupleStateInit(source: StateInit) {
    const builder = new TupleBuilder();
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

export function dictValueParserStateInit(): DictionaryValue<StateInit> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStateInit(src)).endCell());
        },
        parse: (src) => {
            return loadStateInit(src.loadRef().beginParse());
        }
    }
}

export type Context = {
    $$type: 'Context';
    bounceable: boolean;
    sender: Address;
    value: bigint;
    raw: Slice;
}

export function storeContext(src: Context) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBit(src.bounceable);
        b_0.storeAddress(src.sender);
        b_0.storeInt(src.value, 257);
        b_0.storeRef(src.raw.asCell());
    };
}

export function loadContext(slice: Slice) {
    const sc_0 = slice;
    const _bounceable = sc_0.loadBit();
    const _sender = sc_0.loadAddress();
    const _value = sc_0.loadIntBig(257);
    const _raw = sc_0.loadRef().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadGetterTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function storeTupleContext(source: Context) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.bounceable);
    builder.writeAddress(source.sender);
    builder.writeNumber(source.value);
    builder.writeSlice(source.raw.asCell());
    return builder.build();
}

export function dictValueParserContext(): DictionaryValue<Context> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContext(src)).endCell());
        },
        parse: (src) => {
            return loadContext(src.loadRef().beginParse());
        }
    }
}

export type SendParameters = {
    $$type: 'SendParameters';
    mode: bigint;
    body: Cell | null;
    code: Cell | null;
    data: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeSendParameters(src: SendParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        if (src.code !== null && src.code !== undefined) { b_0.storeBit(true).storeRef(src.code); } else { b_0.storeBit(false); }
        if (src.data !== null && src.data !== undefined) { b_0.storeBit(true).storeRef(src.data); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadSendParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _code = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _data = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleSendParameters(source: SendParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserSendParameters(): DictionaryValue<SendParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSendParameters(src)).endCell());
        },
        parse: (src) => {
            return loadSendParameters(src.loadRef().beginParse());
        }
    }
}

export type MessageParameters = {
    $$type: 'MessageParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeMessageParameters(src: MessageParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadMessageParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleMessageParameters(source: MessageParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserMessageParameters(): DictionaryValue<MessageParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMessageParameters(src)).endCell());
        },
        parse: (src) => {
            return loadMessageParameters(src.loadRef().beginParse());
        }
    }
}

export type DeployParameters = {
    $$type: 'DeployParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    bounce: boolean;
    init: StateInit;
}

export function storeDeployParameters(src: DeployParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeBit(src.bounce);
        b_0.store(storeStateInit(src.init));
    };
}

export function loadDeployParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _bounce = sc_0.loadBit();
    const _init = loadStateInit(sc_0);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadGetterTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadGetterTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function storeTupleDeployParameters(source: DeployParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeBoolean(source.bounce);
    builder.writeTuple(storeTupleStateInit(source.init));
    return builder.build();
}

export function dictValueParserDeployParameters(): DictionaryValue<DeployParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployParameters(src)).endCell());
        },
        parse: (src) => {
            return loadDeployParameters(src.loadRef().beginParse());
        }
    }
}

export type StdAddress = {
    $$type: 'StdAddress';
    workchain: bigint;
    address: bigint;
}

export function storeStdAddress(src: StdAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 8);
        b_0.storeUint(src.address, 256);
    };
}

export function loadStdAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(8);
    const _address = sc_0.loadUintBig(256);
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleStdAddress(source: StdAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeNumber(source.address);
    return builder.build();
}

export function dictValueParserStdAddress(): DictionaryValue<StdAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStdAddress(src)).endCell());
        },
        parse: (src) => {
            return loadStdAddress(src.loadRef().beginParse());
        }
    }
}

export type VarAddress = {
    $$type: 'VarAddress';
    workchain: bigint;
    address: Slice;
}

export function storeVarAddress(src: VarAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 32);
        b_0.storeRef(src.address.asCell());
    };
}

export function loadVarAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(32);
    const _address = sc_0.loadRef().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleVarAddress(source: VarAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeSlice(source.address.asCell());
    return builder.build();
}

export function dictValueParserVarAddress(): DictionaryValue<VarAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVarAddress(src)).endCell());
        },
        parse: (src) => {
            return loadVarAddress(src.loadRef().beginParse());
        }
    }
}

export type BasechainAddress = {
    $$type: 'BasechainAddress';
    hash: bigint | null;
}

export function storeBasechainAddress(src: BasechainAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        if (src.hash !== null && src.hash !== undefined) { b_0.storeBit(true).storeInt(src.hash, 257); } else { b_0.storeBit(false); }
    };
}

export function loadBasechainAddress(slice: Slice) {
    const sc_0 = slice;
    const _hash = sc_0.loadBit() ? sc_0.loadIntBig(257) : null;
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadGetterTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function storeTupleBasechainAddress(source: BasechainAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.hash);
    return builder.build();
}

export function dictValueParserBasechainAddress(): DictionaryValue<BasechainAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBasechainAddress(src)).endCell());
        },
        parse: (src) => {
            return loadBasechainAddress(src.loadRef().beginParse());
        }
    }
}

export type Deploy = {
    $$type: 'Deploy';
    queryId: bigint;
}

export function storeDeploy(src: Deploy) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2490013878, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeploy(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2490013878) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function loadTupleDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function loadGetterTupleDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function storeTupleDeploy(source: Deploy) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserDeploy(): DictionaryValue<Deploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadDeploy(src.loadRef().beginParse());
        }
    }
}

export type DeployOk = {
    $$type: 'DeployOk';
    queryId: bigint;
}

export function storeDeployOk(src: DeployOk) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2952335191, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeployOk(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2952335191) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function loadTupleDeployOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function loadGetterTupleDeployOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function storeTupleDeployOk(source: DeployOk) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserDeployOk(): DictionaryValue<DeployOk> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployOk(src)).endCell());
        },
        parse: (src) => {
            return loadDeployOk(src.loadRef().beginParse());
        }
    }
}

export type FactoryDeploy = {
    $$type: 'FactoryDeploy';
    queryId: bigint;
    cashback: Address;
}

export function storeFactoryDeploy(src: FactoryDeploy) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1829761339, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.cashback);
    };
}

export function loadFactoryDeploy(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1829761339) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _cashback = sc_0.loadAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function loadTupleFactoryDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function loadGetterTupleFactoryDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function storeTupleFactoryDeploy(source: FactoryDeploy) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.cashback);
    return builder.build();
}

export function dictValueParserFactoryDeploy(): DictionaryValue<FactoryDeploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeFactoryDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadFactoryDeploy(src.loadRef().beginParse());
        }
    }
}

export type CreateRound = {
    $$type: 'CreateRound';
    stakeTON: bigint;
    mode: bigint;
    deadline: bigint;
    targetParticipants: bigint;
}

export function storeCreateRound(src: CreateRound) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(4022962775, 32);
        b_0.storeCoins(src.stakeTON);
        b_0.storeUint(src.mode, 8);
        b_0.storeUint(src.deadline, 32);
        b_0.storeUint(src.targetParticipants, 16);
    };
}

export function loadCreateRound(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 4022962775) { throw Error('Invalid prefix'); }
    const _stakeTON = sc_0.loadCoins();
    const _mode = sc_0.loadUintBig(8);
    const _deadline = sc_0.loadUintBig(32);
    const _targetParticipants = sc_0.loadUintBig(16);
    return { $$type: 'CreateRound' as const, stakeTON: _stakeTON, mode: _mode, deadline: _deadline, targetParticipants: _targetParticipants };
}

export function loadTupleCreateRound(source: TupleReader) {
    const _stakeTON = source.readBigNumber();
    const _mode = source.readBigNumber();
    const _deadline = source.readBigNumber();
    const _targetParticipants = source.readBigNumber();
    return { $$type: 'CreateRound' as const, stakeTON: _stakeTON, mode: _mode, deadline: _deadline, targetParticipants: _targetParticipants };
}

export function loadGetterTupleCreateRound(source: TupleReader) {
    const _stakeTON = source.readBigNumber();
    const _mode = source.readBigNumber();
    const _deadline = source.readBigNumber();
    const _targetParticipants = source.readBigNumber();
    return { $$type: 'CreateRound' as const, stakeTON: _stakeTON, mode: _mode, deadline: _deadline, targetParticipants: _targetParticipants };
}

export function storeTupleCreateRound(source: CreateRound) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.stakeTON);
    builder.writeNumber(source.mode);
    builder.writeNumber(source.deadline);
    builder.writeNumber(source.targetParticipants);
    return builder.build();
}

export function dictValueParserCreateRound(): DictionaryValue<CreateRound> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeCreateRound(src)).endCell());
        },
        parse: (src) => {
            return loadCreateRound(src.loadRef().beginParse());
        }
    }
}

export type JoinRound = {
    $$type: 'JoinRound';
    roundId: bigint;
    referrer: Address | null;
}

export function storeJoinRound(src: JoinRound) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1454043309, 32);
        b_0.storeUint(src.roundId, 32);
        b_0.storeAddress(src.referrer);
    };
}

export function loadJoinRound(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1454043309) { throw Error('Invalid prefix'); }
    const _roundId = sc_0.loadUintBig(32);
    const _referrer = sc_0.loadMaybeAddress();
    return { $$type: 'JoinRound' as const, roundId: _roundId, referrer: _referrer };
}

export function loadTupleJoinRound(source: TupleReader) {
    const _roundId = source.readBigNumber();
    const _referrer = source.readAddressOpt();
    return { $$type: 'JoinRound' as const, roundId: _roundId, referrer: _referrer };
}

export function loadGetterTupleJoinRound(source: TupleReader) {
    const _roundId = source.readBigNumber();
    const _referrer = source.readAddressOpt();
    return { $$type: 'JoinRound' as const, roundId: _roundId, referrer: _referrer };
}

export function storeTupleJoinRound(source: JoinRound) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.roundId);
    builder.writeAddress(source.referrer);
    return builder.build();
}

export function dictValueParserJoinRound(): DictionaryValue<JoinRound> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJoinRound(src)).endCell());
        },
        parse: (src) => {
            return loadJoinRound(src.loadRef().beginParse());
        }
    }
}

export type DistributeRound = {
    $$type: 'DistributeRound';
    roundId: bigint;
    seed: bigint;
    blockHash: bigint;
}

export function storeDistributeRound(src: DistributeRound) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3093325733, 32);
        b_0.storeUint(src.roundId, 32);
        b_0.storeUint(src.seed, 256);
        b_0.storeUint(src.blockHash, 256);
    };
}

export function loadDistributeRound(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3093325733) { throw Error('Invalid prefix'); }
    const _roundId = sc_0.loadUintBig(32);
    const _seed = sc_0.loadUintBig(256);
    const _blockHash = sc_0.loadUintBig(256);
    return { $$type: 'DistributeRound' as const, roundId: _roundId, seed: _seed, blockHash: _blockHash };
}

export function loadTupleDistributeRound(source: TupleReader) {
    const _roundId = source.readBigNumber();
    const _seed = source.readBigNumber();
    const _blockHash = source.readBigNumber();
    return { $$type: 'DistributeRound' as const, roundId: _roundId, seed: _seed, blockHash: _blockHash };
}

export function loadGetterTupleDistributeRound(source: TupleReader) {
    const _roundId = source.readBigNumber();
    const _seed = source.readBigNumber();
    const _blockHash = source.readBigNumber();
    return { $$type: 'DistributeRound' as const, roundId: _roundId, seed: _seed, blockHash: _blockHash };
}

export function storeTupleDistributeRound(source: DistributeRound) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.roundId);
    builder.writeNumber(source.seed);
    builder.writeNumber(source.blockHash);
    return builder.build();
}

export function dictValueParserDistributeRound(): DictionaryValue<DistributeRound> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDistributeRound(src)).endCell());
        },
        parse: (src) => {
            return loadDistributeRound(src.loadRef().beginParse());
        }
    }
}

export type SetReferrer = {
    $$type: 'SetReferrer';
    inviter: Address;
}

export function storeSetReferrer(src: SetReferrer) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(360110510, 32);
        b_0.storeAddress(src.inviter);
    };
}

export function loadSetReferrer(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 360110510) { throw Error('Invalid prefix'); }
    const _inviter = sc_0.loadAddress();
    return { $$type: 'SetReferrer' as const, inviter: _inviter };
}

export function loadTupleSetReferrer(source: TupleReader) {
    const _inviter = source.readAddress();
    return { $$type: 'SetReferrer' as const, inviter: _inviter };
}

export function loadGetterTupleSetReferrer(source: TupleReader) {
    const _inviter = source.readAddress();
    return { $$type: 'SetReferrer' as const, inviter: _inviter };
}

export function storeTupleSetReferrer(source: SetReferrer) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.inviter);
    return builder.build();
}

export function dictValueParserSetReferrer(): DictionaryValue<SetReferrer> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetReferrer(src)).endCell());
        },
        parse: (src) => {
            return loadSetReferrer(src.loadRef().beginParse());
        }
    }
}

export type ReferralReward = {
    $$type: 'ReferralReward';
    fromUser: Address;
    amount: bigint;
    roundId: bigint;
}

export function storeReferralReward(src: ReferralReward) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3397871895, 32);
        b_0.storeAddress(src.fromUser);
        b_0.storeCoins(src.amount);
        b_0.storeUint(src.roundId, 32);
    };
}

export function loadReferralReward(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3397871895) { throw Error('Invalid prefix'); }
    const _fromUser = sc_0.loadAddress();
    const _amount = sc_0.loadCoins();
    const _roundId = sc_0.loadUintBig(32);
    return { $$type: 'ReferralReward' as const, fromUser: _fromUser, amount: _amount, roundId: _roundId };
}

export function loadTupleReferralReward(source: TupleReader) {
    const _fromUser = source.readAddress();
    const _amount = source.readBigNumber();
    const _roundId = source.readBigNumber();
    return { $$type: 'ReferralReward' as const, fromUser: _fromUser, amount: _amount, roundId: _roundId };
}

export function loadGetterTupleReferralReward(source: TupleReader) {
    const _fromUser = source.readAddress();
    const _amount = source.readBigNumber();
    const _roundId = source.readBigNumber();
    return { $$type: 'ReferralReward' as const, fromUser: _fromUser, amount: _amount, roundId: _roundId };
}

export function storeTupleReferralReward(source: ReferralReward) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.fromUser);
    builder.writeNumber(source.amount);
    builder.writeNumber(source.roundId);
    return builder.build();
}

export function dictValueParserReferralReward(): DictionaryValue<ReferralReward> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeReferralReward(src)).endCell());
        },
        parse: (src) => {
            return loadReferralReward(src.loadRef().beginParse());
        }
    }
}

export type UpdateFee = {
    $$type: 'UpdateFee';
    platformFeePercent: bigint;
    referralPercent: bigint;
}

export function storeUpdateFee(src: UpdateFee) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2921075543, 32);
        b_0.storeInt(src.platformFeePercent, 257);
        b_0.storeInt(src.referralPercent, 257);
    };
}

export function loadUpdateFee(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2921075543) { throw Error('Invalid prefix'); }
    const _platformFeePercent = sc_0.loadIntBig(257);
    const _referralPercent = sc_0.loadIntBig(257);
    return { $$type: 'UpdateFee' as const, platformFeePercent: _platformFeePercent, referralPercent: _referralPercent };
}

export function loadTupleUpdateFee(source: TupleReader) {
    const _platformFeePercent = source.readBigNumber();
    const _referralPercent = source.readBigNumber();
    return { $$type: 'UpdateFee' as const, platformFeePercent: _platformFeePercent, referralPercent: _referralPercent };
}

export function loadGetterTupleUpdateFee(source: TupleReader) {
    const _platformFeePercent = source.readBigNumber();
    const _referralPercent = source.readBigNumber();
    return { $$type: 'UpdateFee' as const, platformFeePercent: _platformFeePercent, referralPercent: _referralPercent };
}

export function storeTupleUpdateFee(source: UpdateFee) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.platformFeePercent);
    builder.writeNumber(source.referralPercent);
    return builder.build();
}

export function dictValueParserUpdateFee(): DictionaryValue<UpdateFee> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUpdateFee(src)).endCell());
        },
        parse: (src) => {
            return loadUpdateFee(src.loadRef().beginParse());
        }
    }
}

export type Round = {
    $$type: 'Round';
    id: bigint;
    creator: Address;
    stakeTON: bigint;
    mode: bigint;
    status: bigint;
    participants: Dictionary<Address, boolean>;
    participantsList: Dictionary<bigint, Address>;
    participantsCount: bigint;
    deadline: bigint;
    targetParticipants: bigint;
    bank: bigint;
    platformFee: bigint;
    distributedAt: bigint;
    seed: bigint;
    blockHash: bigint;
}

export function storeRound(src: Round) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(src.id, 32);
        b_0.storeAddress(src.creator);
        b_0.storeCoins(src.stakeTON);
        b_0.storeUint(src.mode, 8);
        b_0.storeUint(src.status, 8);
        b_0.storeDict(src.participants, Dictionary.Keys.Address(), Dictionary.Values.Bool());
        b_0.storeDict(src.participantsList, Dictionary.Keys.BigInt(257), Dictionary.Values.Address());
        b_0.storeUint(src.participantsCount, 16);
        b_0.storeUint(src.deadline, 32);
        b_0.storeUint(src.targetParticipants, 16);
        b_0.storeCoins(src.bank);
        b_0.storeCoins(src.platformFee);
        b_0.storeUint(src.distributedAt, 32);
        const b_1 = new Builder();
        b_1.storeUint(src.seed, 256);
        b_1.storeUint(src.blockHash, 256);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadRound(slice: Slice) {
    const sc_0 = slice;
    const _id = sc_0.loadUintBig(32);
    const _creator = sc_0.loadAddress();
    const _stakeTON = sc_0.loadCoins();
    const _mode = sc_0.loadUintBig(8);
    const _status = sc_0.loadUintBig(8);
    const _participants = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.Bool(), sc_0);
    const _participantsList = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), sc_0);
    const _participantsCount = sc_0.loadUintBig(16);
    const _deadline = sc_0.loadUintBig(32);
    const _targetParticipants = sc_0.loadUintBig(16);
    const _bank = sc_0.loadCoins();
    const _platformFee = sc_0.loadCoins();
    const _distributedAt = sc_0.loadUintBig(32);
    const sc_1 = sc_0.loadRef().beginParse();
    const _seed = sc_1.loadUintBig(256);
    const _blockHash = sc_1.loadUintBig(256);
    return { $$type: 'Round' as const, id: _id, creator: _creator, stakeTON: _stakeTON, mode: _mode, status: _status, participants: _participants, participantsList: _participantsList, participantsCount: _participantsCount, deadline: _deadline, targetParticipants: _targetParticipants, bank: _bank, platformFee: _platformFee, distributedAt: _distributedAt, seed: _seed, blockHash: _blockHash };
}

export function loadTupleRound(source: TupleReader) {
    const _id = source.readBigNumber();
    const _creator = source.readAddress();
    const _stakeTON = source.readBigNumber();
    const _mode = source.readBigNumber();
    const _status = source.readBigNumber();
    const _participants = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Bool(), source.readCellOpt());
    const _participantsList = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), source.readCellOpt());
    const _participantsCount = source.readBigNumber();
    const _deadline = source.readBigNumber();
    const _targetParticipants = source.readBigNumber();
    const _bank = source.readBigNumber();
    const _platformFee = source.readBigNumber();
    const _distributedAt = source.readBigNumber();
    const _seed = source.readBigNumber();
    const _blockHash = source.readBigNumber();
    return { $$type: 'Round' as const, id: _id, creator: _creator, stakeTON: _stakeTON, mode: _mode, status: _status, participants: _participants, participantsList: _participantsList, participantsCount: _participantsCount, deadline: _deadline, targetParticipants: _targetParticipants, bank: _bank, platformFee: _platformFee, distributedAt: _distributedAt, seed: _seed, blockHash: _blockHash };
}

export function loadGetterTupleRound(source: TupleReader) {
    const _id = source.readBigNumber();
    const _creator = source.readAddress();
    const _stakeTON = source.readBigNumber();
    const _mode = source.readBigNumber();
    const _status = source.readBigNumber();
    const _participants = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Bool(), source.readCellOpt());
    const _participantsList = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), source.readCellOpt());
    const _participantsCount = source.readBigNumber();
    const _deadline = source.readBigNumber();
    const _targetParticipants = source.readBigNumber();
    const _bank = source.readBigNumber();
    const _platformFee = source.readBigNumber();
    const _distributedAt = source.readBigNumber();
    const _seed = source.readBigNumber();
    const _blockHash = source.readBigNumber();
    return { $$type: 'Round' as const, id: _id, creator: _creator, stakeTON: _stakeTON, mode: _mode, status: _status, participants: _participants, participantsList: _participantsList, participantsCount: _participantsCount, deadline: _deadline, targetParticipants: _targetParticipants, bank: _bank, platformFee: _platformFee, distributedAt: _distributedAt, seed: _seed, blockHash: _blockHash };
}

export function storeTupleRound(source: Round) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.id);
    builder.writeAddress(source.creator);
    builder.writeNumber(source.stakeTON);
    builder.writeNumber(source.mode);
    builder.writeNumber(source.status);
    builder.writeCell(source.participants.size > 0 ? beginCell().storeDictDirect(source.participants, Dictionary.Keys.Address(), Dictionary.Values.Bool()).endCell() : null);
    builder.writeCell(source.participantsList.size > 0 ? beginCell().storeDictDirect(source.participantsList, Dictionary.Keys.BigInt(257), Dictionary.Values.Address()).endCell() : null);
    builder.writeNumber(source.participantsCount);
    builder.writeNumber(source.deadline);
    builder.writeNumber(source.targetParticipants);
    builder.writeNumber(source.bank);
    builder.writeNumber(source.platformFee);
    builder.writeNumber(source.distributedAt);
    builder.writeNumber(source.seed);
    builder.writeNumber(source.blockHash);
    return builder.build();
}

export function dictValueParserRound(): DictionaryValue<Round> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRound(src)).endCell());
        },
        parse: (src) => {
            return loadRound(src.loadRef().beginParse());
        }
    }
}

export type ReferralStats = {
    $$type: 'ReferralStats';
    totalInvited: bigint;
    totalEarned: bigint;
    totalRewards: bigint;
}

export function storeReferralStats(src: ReferralStats) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(src.totalInvited, 16);
        b_0.storeCoins(src.totalEarned);
        b_0.storeUint(src.totalRewards, 16);
    };
}

export function loadReferralStats(slice: Slice) {
    const sc_0 = slice;
    const _totalInvited = sc_0.loadUintBig(16);
    const _totalEarned = sc_0.loadCoins();
    const _totalRewards = sc_0.loadUintBig(16);
    return { $$type: 'ReferralStats' as const, totalInvited: _totalInvited, totalEarned: _totalEarned, totalRewards: _totalRewards };
}

export function loadTupleReferralStats(source: TupleReader) {
    const _totalInvited = source.readBigNumber();
    const _totalEarned = source.readBigNumber();
    const _totalRewards = source.readBigNumber();
    return { $$type: 'ReferralStats' as const, totalInvited: _totalInvited, totalEarned: _totalEarned, totalRewards: _totalRewards };
}

export function loadGetterTupleReferralStats(source: TupleReader) {
    const _totalInvited = source.readBigNumber();
    const _totalEarned = source.readBigNumber();
    const _totalRewards = source.readBigNumber();
    return { $$type: 'ReferralStats' as const, totalInvited: _totalInvited, totalEarned: _totalEarned, totalRewards: _totalRewards };
}

export function storeTupleReferralStats(source: ReferralStats) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.totalInvited);
    builder.writeNumber(source.totalEarned);
    builder.writeNumber(source.totalRewards);
    return builder.build();
}

export function dictValueParserReferralStats(): DictionaryValue<ReferralStats> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeReferralStats(src)).endCell());
        },
        parse: (src) => {
            return loadReferralStats(src.loadRef().beginParse());
        }
    }
}

export type GameContract$Data = {
    $$type: 'GameContract$Data';
    admin: Address;
    platformFeePercent: bigint;
    referralPercent: bigint;
    roundsCount: bigint;
    rounds: Dictionary<bigint, Round>;
    referrerOf: Dictionary<Address, Address>;
    referralStats: Dictionary<Address, ReferralStats>;
    minStakeTON: bigint;
    maxStakeTON: bigint;
    minParticipants: bigint;
    maxParticipants: bigint;
}

export function storeGameContract$Data(src: GameContract$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.admin);
        b_0.storeUint(src.platformFeePercent, 8);
        b_0.storeUint(src.referralPercent, 8);
        b_0.storeUint(src.roundsCount, 32);
        b_0.storeDict(src.rounds, Dictionary.Keys.BigInt(257), dictValueParserRound());
        b_0.storeDict(src.referrerOf, Dictionary.Keys.Address(), Dictionary.Values.Address());
        b_0.storeDict(src.referralStats, Dictionary.Keys.Address(), dictValueParserReferralStats());
        b_0.storeCoins(src.minStakeTON);
        b_0.storeCoins(src.maxStakeTON);
        b_0.storeUint(src.minParticipants, 16);
        b_0.storeUint(src.maxParticipants, 16);
    };
}

export function loadGameContract$Data(slice: Slice) {
    const sc_0 = slice;
    const _admin = sc_0.loadAddress();
    const _platformFeePercent = sc_0.loadUintBig(8);
    const _referralPercent = sc_0.loadUintBig(8);
    const _roundsCount = sc_0.loadUintBig(32);
    const _rounds = Dictionary.load(Dictionary.Keys.BigInt(257), dictValueParserRound(), sc_0);
    const _referrerOf = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.Address(), sc_0);
    const _referralStats = Dictionary.load(Dictionary.Keys.Address(), dictValueParserReferralStats(), sc_0);
    const _minStakeTON = sc_0.loadCoins();
    const _maxStakeTON = sc_0.loadCoins();
    const _minParticipants = sc_0.loadUintBig(16);
    const _maxParticipants = sc_0.loadUintBig(16);
    return { $$type: 'GameContract$Data' as const, admin: _admin, platformFeePercent: _platformFeePercent, referralPercent: _referralPercent, roundsCount: _roundsCount, rounds: _rounds, referrerOf: _referrerOf, referralStats: _referralStats, minStakeTON: _minStakeTON, maxStakeTON: _maxStakeTON, minParticipants: _minParticipants, maxParticipants: _maxParticipants };
}

export function loadTupleGameContract$Data(source: TupleReader) {
    const _admin = source.readAddress();
    const _platformFeePercent = source.readBigNumber();
    const _referralPercent = source.readBigNumber();
    const _roundsCount = source.readBigNumber();
    const _rounds = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserRound(), source.readCellOpt());
    const _referrerOf = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Address(), source.readCellOpt());
    const _referralStats = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserReferralStats(), source.readCellOpt());
    const _minStakeTON = source.readBigNumber();
    const _maxStakeTON = source.readBigNumber();
    const _minParticipants = source.readBigNumber();
    const _maxParticipants = source.readBigNumber();
    return { $$type: 'GameContract$Data' as const, admin: _admin, platformFeePercent: _platformFeePercent, referralPercent: _referralPercent, roundsCount: _roundsCount, rounds: _rounds, referrerOf: _referrerOf, referralStats: _referralStats, minStakeTON: _minStakeTON, maxStakeTON: _maxStakeTON, minParticipants: _minParticipants, maxParticipants: _maxParticipants };
}

export function loadGetterTupleGameContract$Data(source: TupleReader) {
    const _admin = source.readAddress();
    const _platformFeePercent = source.readBigNumber();
    const _referralPercent = source.readBigNumber();
    const _roundsCount = source.readBigNumber();
    const _rounds = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserRound(), source.readCellOpt());
    const _referrerOf = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Address(), source.readCellOpt());
    const _referralStats = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserReferralStats(), source.readCellOpt());
    const _minStakeTON = source.readBigNumber();
    const _maxStakeTON = source.readBigNumber();
    const _minParticipants = source.readBigNumber();
    const _maxParticipants = source.readBigNumber();
    return { $$type: 'GameContract$Data' as const, admin: _admin, platformFeePercent: _platformFeePercent, referralPercent: _referralPercent, roundsCount: _roundsCount, rounds: _rounds, referrerOf: _referrerOf, referralStats: _referralStats, minStakeTON: _minStakeTON, maxStakeTON: _maxStakeTON, minParticipants: _minParticipants, maxParticipants: _maxParticipants };
}

export function storeTupleGameContract$Data(source: GameContract$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.admin);
    builder.writeNumber(source.platformFeePercent);
    builder.writeNumber(source.referralPercent);
    builder.writeNumber(source.roundsCount);
    builder.writeCell(source.rounds.size > 0 ? beginCell().storeDictDirect(source.rounds, Dictionary.Keys.BigInt(257), dictValueParserRound()).endCell() : null);
    builder.writeCell(source.referrerOf.size > 0 ? beginCell().storeDictDirect(source.referrerOf, Dictionary.Keys.Address(), Dictionary.Values.Address()).endCell() : null);
    builder.writeCell(source.referralStats.size > 0 ? beginCell().storeDictDirect(source.referralStats, Dictionary.Keys.Address(), dictValueParserReferralStats()).endCell() : null);
    builder.writeNumber(source.minStakeTON);
    builder.writeNumber(source.maxStakeTON);
    builder.writeNumber(source.minParticipants);
    builder.writeNumber(source.maxParticipants);
    return builder.build();
}

export function dictValueParserGameContract$Data(): DictionaryValue<GameContract$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeGameContract$Data(src)).endCell());
        },
        parse: (src) => {
            return loadGameContract$Data(src.loadRef().beginParse());
        }
    }
}

 type GameContract_init_args = {
    $$type: 'GameContract_init_args';
    admin: Address;
}

function initGameContract_init_args(src: GameContract_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.admin);
    };
}

async function GameContract_init(admin: Address) {
    const __code = Cell.fromHex('b5ee9c7241023401000da7000228ff008e88f4a413f4bcf2c80bed5320e303ed43d90112020271020d0201200308020120040601d5b719bda89a1a400031c4df481a60fa60fa63fe809a803a1e809e809f401f401a61fa61e6020d620d420d220d020ced8371c37f4800203a2eae4e0dadadb04200bebc20104302e90edd0004d00c9c4aa15b678d96240dd2460db3240dde5a100de46de07c440dd2460dbbd005004481010b260259f40b6fa192306ddf206e92306d9dd0d30ffa00d30f55206c136f03e201d5b50a5da89a1a400031c4df481a60fa60fa63fe809a803a1e809e809f401f401a61fa61e6020d620d420d220d020ced8371c37f4800203a2eae4e0dadadb04200bebc20104302e90edd0004d00c9c4aa15b678d96240dd2460db3240dde5a100de5ede1fc440dd2460dbbd007013a810101280259f40d6fa192306ddf206e92306d8e87d0db3c6c1f6f0fe228020162090b01a5ad3576a268690000c7137d206983e983e98ffa026a00e87a027a027d007d006987e9879808358835083488340833b60dc70dfd200080e8bab93836b6b6c10802faf080410c0ba43b7400134032716d9e3658c00a00022801a5acf976a268690000c7137d206983e983e98ffa026a00e87a027a027d007d006987e9879808358835083488340833b60dc70dfd200080e8bab93836b6b6c10802faf080410c0ba43b7400134032716d9e3658c00c0002270201200e1001a9bac33ed44d0d200018e26fa40d307d307d31ff404d401d0f404f404fa00fa00d30fd30f30106b106a1069106810676c1b8e1bfa400101d17572706d6d6d821005f5e1008218174876e800268064e2550adb3c6cb180f001c81010b270259f40a6fa192306ddf01a5b8b5ced44d0d200018e26fa40d307d307d31ff404d401d0f404f404fa00fa00d30fd30f30106b106a1069106810676c1b8e1bfa400101d17572706d6d6d821005f5e1008218174876e800268064e2db3c6cb181100022902ee30eda2edfb01d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018e26fa40d307d307d31ff404d401d0f404f404fa00fa00d30fd30f30106b106a1069106810676c1b8e1bfa400101d17572706d6d6d821005f5e1008218174876e800268064e20c925f0ce02ad749c21fe3000af901133204520ad31f218210efc98a57bae30221821056aaf0adbae3022182101576d9aebae302218210b86067a5ba1416232702fc31fa00d307d31fd30f30f8416f2430328200ce1426820afaf080a013be12f2f48126e75357bef2f4817f1e5356bbf2f40aa4706d6d547222547000290c561451cf0c10bf10af109f108f107f465f41440355d08101010fc855e0db3cc922103901206e953059f45a30944133f415e22610bd10ac109b509a1068105710462c1501701035504443136ddb3cc87f01ca0055a050abce18cb0716cb0714cb1f12f40001c8f40012f40058fa0258fa0212cb0f12cb0fcdc9ed54db311b04fc31d31fd72c01916d93fa4001e231f8416f243032288101012559f40d6fa192306ddf206e92306d8e87d0db3c6c1f6f0fe2206ef2d0806f2f5f0932333381133d02c00012f2f4810af521820afaf080a015be14f2f481010b22714133f40a6fa19401d70030925b6de27f216e925b7f91bde2f2e581226eb39170e30de3002817181a001e2781010b2259f40a6fa192306ddf6e01fe81010b23206ef2d08022103a01206e953059f4593096c8ce4133f441e281010b23206ef2d080285959f40b6fa192306ddf206e92306d9dd0d30ffa00d30f55206c136f03e2206e8e32206ef2d0806f2302a481010b26206ef2d0805034c855205023cb0f01fa02cb0fc9103912206e953059f45930944133f413e2e30d060719005e3070530002a481010b26206ef2d0805034c855205023cb0f01fa02cb0fc9103912206e953059f45930944133f413e2018810ce10bd10ac109b108a107910681057104602db3cc87f01ca0055a050abce18cb0716cb0714cb1f12f40001c8f40012f40058fa0258fa0212cb0f12cb0fcdc9ed54db311b02f030298101012459f40d6fa192306ddf206e92306d8e87d0db3c6c1f6f0fe2206ef2d0806f2f0981010b56117f71216e955b59f4593098c801cf004133f441e208810101285612206e953059f45a30944133f414e207a42f561ca88064a90411105610a115a0513fa00c111c0c0b111b0b0a111a0a09111909281c03e40811180807111707061116060511150504111404031113030211120211101fdb3c5619c0019556125614be9170e293715719de10cd10bc0b111a0b0a11190a09111809081116080711150706111206051114050411130403111103102e01111001111a8101011118c855e0db3cc910354aa01d2c2201a02781010b2259f40a6fa192306ddf206eb38e3b5b52b0716d5a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00e30d1e01f0532ba88064a9045133a121206ef2d08071514570c855208210ca8769175004cb1f12ce01fa02cb1fc954451350555a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0081010b21206ef2d080295959f40b6fa192306ddf1f02f8206e92306d9dd0d30ffa00d30f55206c136f03e2206e8e35206ef2d0806f2305a004a481010b03206ef2d0805055c855205023cb0f01fa02cb0fc910384180206e953059f45930944133f413e2e30d52b6716d5a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf818ae2f400c901fb00202100643070530005a004a481010b03206ef2d0805055c855205023cb0f01fa02cb0fc910384180206e953059f45930944133f413e2001a58cf8680cf8480f400f400cf810038206e953059f45a30944133f415e2109a10891068105706104513444003ea31fa4030f8416f2410235f038200d3bb2681010b2359f40a6fa192306ddf6ef2f48130335321c705b3f2f41581010b5116206e953059f4593096c8ce4133f441e22381010b2659f40b6fa192306ddf206e92306d9dd0d30ffa00d30f55206c136f03e2206ee30f108a10791068105710461035503424252600543070530002a481010b5023c855205023cb0f01fa02cb0fc910354160206e953059f45930944133f413e2005a206ef2d0806f2302a481010b5023c855205023cb0f01fa02cb0fc910354160206e953059f45930944133f413e2005ec87f01ca0055a050abce18cb0716cb0714cb1f12f40001c8f40012f40058fa0258fa0212cb0f12cb0fcdc9ed54db3103fe8f7d31d31fd3ffd3ff30810daef8422dc705f2f4278101012459f40d6fa192306ddf206e92306d8e87d0db3c6c1f6f0fe2206ef2d0806f2f5f038200864308c00118f2f4817180245619bef2f472f82353ed0c111a0c0b11190b0a11180a09111709081116080711150706111406051113050411120403111b0302111c022e28292e0078d31ffa40fa00d307d307f404f404d30fd31fd30ffa00fa00d31fd401d0d3ffd3ff30102f102e102d102c102b102a102910281027102610251024102303fe544e30561c02561c02561f02561c02561c02561c02561c02561c02561c025623025628542213520201111f01111edb3c10cd10bc0b11180b0a11170a091119090811150807111407061113060511120504111104031110030211160201111a0111188101010fc855e0db3cc9103612206e953059f45a30944133f415e2107a2a2c2d01d050875f06353535363603a75fa732812710a9045304a814a159a0706d21935306b98e3903821041c64e6da8813039a0a9381e2082080f4240a908a4810101541300546650216e955b59f45a3098c801cf004133f442e25aa003a41023e8303270935305b98ae85f072b00e2268101012259f40c6fa192306ddf206ef2d08081010154540052404133f40c6fa19401d70030925b6de2206ef2d0805250a823a9045260a0716d5a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00a4005850efcb1f1cce500afa0218cb0716cb0714f40012f400cb0fcb1fcb0f01fa0201fa02cb1f01c8cbff12cbffcd006e1058104746165045c87f01ca0055a050abce18cb0716cb0714cb1f12f40001c8f40012f40058fa0258fa0212cb0f12cb0fcdc9ed54db31022ce0218210ae1c1357bae302018210946a98b6bae3020a2f3101fe31373705810101d700810101d70030f8416f245b81404d322ac705f2f48200f56122c2ff9322c1659170e2f2f4814c0921c2ff9321c1659170e2f2f48200b6dc5312bbf2f408509a10571046103510241023c87f01ca0055a050abce18cb0716cb0714cb1f12f40001c8f40012f40058fa0258fa0212cb0f12cb0fcdc9ed54300004db3100e6d33f30c8018210aff90f5758cb1fcb3fc9109b108a107910681057104610354430f84270705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00c87f01ca0055a050abce18cb0716cb0714cb1f12f40001c8f40012f40058fa0258fa0212cb0f12cb0fcdc9ed54db31015482f0e944ec21c357d5274e46746b5bbe7d36de7a894b603aafe01e764256f7e52df8bae3025f0bf2c0823300ec81404df8422ac705f2f4287083066d5a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00108a5517c87f01ca0055a050abce18cb0716cb0714cb1f12f40001c8f40012f40058fa0258fa0212cb0f12cb0fcdc9ed5474df15c0');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initGameContract_init_args({ $$type: 'GameContract_init_args', admin })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const GameContract_errors = {
    2: { message: "Stack underflow" },
    3: { message: "Stack overflow" },
    4: { message: "Integer overflow" },
    5: { message: "Integer out of expected range" },
    6: { message: "Invalid opcode" },
    7: { message: "Type check error" },
    8: { message: "Cell overflow" },
    9: { message: "Cell underflow" },
    10: { message: "Dictionary error" },
    11: { message: "'Unknown' error" },
    12: { message: "Fatal error" },
    13: { message: "Out of gas error" },
    14: { message: "Virtualization error" },
    32: { message: "Action list is invalid" },
    33: { message: "Action list is too long" },
    34: { message: "Action is invalid or not supported" },
    35: { message: "Invalid source address in outbound message" },
    36: { message: "Invalid destination address in outbound message" },
    37: { message: "Not enough Toncoin" },
    38: { message: "Not enough extra currencies" },
    39: { message: "Outbound message does not fit into a cell after rewriting" },
    40: { message: "Cannot process a message" },
    41: { message: "Library reference is null" },
    42: { message: "Library change action error" },
    43: { message: "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree" },
    50: { message: "Account state size exceeded limits" },
    128: { message: "Null reference exception" },
    129: { message: "Invalid serialization prefix" },
    130: { message: "Invalid incoming message" },
    131: { message: "Constraints error" },
    132: { message: "Access denied" },
    133: { message: "Contract stopped" },
    134: { message: "Invalid argument" },
    135: { message: "Code of a contract was not found" },
    136: { message: "Invalid standard address" },
    138: { message: "Not a basechain address" },
    1409: { message: "Already participating" },
    2805: { message: "Insufficient value" },
    3502: { message: "Only admin can distribute" },
    4925: { message: "Round not open" },
    9959: { message: "Stake too low" },
    12339: { message: "Cannot refer yourself" },
    16461: { message: "Only admin" },
    19465: { message: "Invalid referral percent" },
    29056: { message: "Not enough participants" },
    32542: { message: "Stake too high" },
    34371: { message: "Round not locked" },
    46812: { message: "Referral exceeds fee" },
    52756: { message: "Insufficient value for stake and gas" },
    54203: { message: "Referrer already set" },
    62817: { message: "Invalid platform fee" },
} as const

export const GameContract_errors_backward = {
    "Stack underflow": 2,
    "Stack overflow": 3,
    "Integer overflow": 4,
    "Integer out of expected range": 5,
    "Invalid opcode": 6,
    "Type check error": 7,
    "Cell overflow": 8,
    "Cell underflow": 9,
    "Dictionary error": 10,
    "'Unknown' error": 11,
    "Fatal error": 12,
    "Out of gas error": 13,
    "Virtualization error": 14,
    "Action list is invalid": 32,
    "Action list is too long": 33,
    "Action is invalid or not supported": 34,
    "Invalid source address in outbound message": 35,
    "Invalid destination address in outbound message": 36,
    "Not enough Toncoin": 37,
    "Not enough extra currencies": 38,
    "Outbound message does not fit into a cell after rewriting": 39,
    "Cannot process a message": 40,
    "Library reference is null": 41,
    "Library change action error": 42,
    "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree": 43,
    "Account state size exceeded limits": 50,
    "Null reference exception": 128,
    "Invalid serialization prefix": 129,
    "Invalid incoming message": 130,
    "Constraints error": 131,
    "Access denied": 132,
    "Contract stopped": 133,
    "Invalid argument": 134,
    "Code of a contract was not found": 135,
    "Invalid standard address": 136,
    "Not a basechain address": 138,
    "Already participating": 1409,
    "Insufficient value": 2805,
    "Only admin can distribute": 3502,
    "Round not open": 4925,
    "Stake too low": 9959,
    "Cannot refer yourself": 12339,
    "Only admin": 16461,
    "Invalid referral percent": 19465,
    "Not enough participants": 29056,
    "Stake too high": 32542,
    "Round not locked": 34371,
    "Referral exceeds fee": 46812,
    "Insufficient value for stake and gas": 52756,
    "Referrer already set": 54203,
    "Invalid platform fee": 62817,
} as const

const GameContract_types: ABIType[] = [
    {"name":"DataSize","header":null,"fields":[{"name":"cells","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bits","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"refs","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"SignedBundle","header":null,"fields":[{"name":"signature","type":{"kind":"simple","type":"fixed-bytes","optional":false,"format":64}},{"name":"signedData","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"StateInit","header":null,"fields":[{"name":"code","type":{"kind":"simple","type":"cell","optional":false}},{"name":"data","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Context","header":null,"fields":[{"name":"bounceable","type":{"kind":"simple","type":"bool","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"raw","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"SendParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"code","type":{"kind":"simple","type":"cell","optional":true}},{"name":"data","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"MessageParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"DeployParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}},{"name":"init","type":{"kind":"simple","type":"StateInit","optional":false}}]},
    {"name":"StdAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":8}},{"name":"address","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"VarAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":32}},{"name":"address","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"BasechainAddress","header":null,"fields":[{"name":"hash","type":{"kind":"simple","type":"int","optional":true,"format":257}}]},
    {"name":"Deploy","header":2490013878,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"DeployOk","header":2952335191,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"FactoryDeploy","header":1829761339,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"cashback","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"CreateRound","header":4022962775,"fields":[{"name":"stakeTON","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"mode","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"deadline","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"targetParticipants","type":{"kind":"simple","type":"uint","optional":false,"format":16}}]},
    {"name":"JoinRound","header":1454043309,"fields":[{"name":"roundId","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"referrer","type":{"kind":"simple","type":"address","optional":true}}]},
    {"name":"DistributeRound","header":3093325733,"fields":[{"name":"roundId","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"seed","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"blockHash","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"SetReferrer","header":360110510,"fields":[{"name":"inviter","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ReferralReward","header":3397871895,"fields":[{"name":"fromUser","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"roundId","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"UpdateFee","header":2921075543,"fields":[{"name":"platformFeePercent","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"referralPercent","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"Round","header":null,"fields":[{"name":"id","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"creator","type":{"kind":"simple","type":"address","optional":false}},{"name":"stakeTON","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"mode","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"status","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"participants","type":{"kind":"dict","key":"address","value":"bool"}},{"name":"participantsList","type":{"kind":"dict","key":"int","value":"address"}},{"name":"participantsCount","type":{"kind":"simple","type":"uint","optional":false,"format":16}},{"name":"deadline","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"targetParticipants","type":{"kind":"simple","type":"uint","optional":false,"format":16}},{"name":"bank","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"platformFee","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"distributedAt","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"seed","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"blockHash","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"ReferralStats","header":null,"fields":[{"name":"totalInvited","type":{"kind":"simple","type":"uint","optional":false,"format":16}},{"name":"totalEarned","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"totalRewards","type":{"kind":"simple","type":"uint","optional":false,"format":16}}]},
    {"name":"GameContract$Data","header":null,"fields":[{"name":"admin","type":{"kind":"simple","type":"address","optional":false}},{"name":"platformFeePercent","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"referralPercent","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"roundsCount","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"rounds","type":{"kind":"dict","key":"int","value":"Round","valueFormat":"ref"}},{"name":"referrerOf","type":{"kind":"dict","key":"address","value":"address"}},{"name":"referralStats","type":{"kind":"dict","key":"address","value":"ReferralStats","valueFormat":"ref"}},{"name":"minStakeTON","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"maxStakeTON","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"minParticipants","type":{"kind":"simple","type":"uint","optional":false,"format":16}},{"name":"maxParticipants","type":{"kind":"simple","type":"uint","optional":false,"format":16}}]},
]

const GameContract_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "CreateRound": 4022962775,
    "JoinRound": 1454043309,
    "DistributeRound": 3093325733,
    "SetReferrer": 360110510,
    "ReferralReward": 3397871895,
    "UpdateFee": 2921075543,
}

const GameContract_getters: ABIGetter[] = [
    {"name":"getRound","methodId":75858,"arguments":[{"name":"roundId","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"Round","optional":true}},
    {"name":"getReferrer","methodId":109619,"arguments":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"address","optional":true}},
    {"name":"getReferralStats","methodId":71885,"arguments":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"ReferralStats","optional":true}},
    {"name":"getTotalRounds","methodId":84466,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"getPlatformFeePercent","methodId":117596,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"getReferralPercent","methodId":82538,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
]

export const GameContract_getterMapping: { [key: string]: string } = {
    'getRound': 'getGetRound',
    'getReferrer': 'getGetReferrer',
    'getReferralStats': 'getGetReferralStats',
    'getTotalRounds': 'getGetTotalRounds',
    'getPlatformFeePercent': 'getGetPlatformFeePercent',
    'getReferralPercent': 'getGetReferralPercent',
}

const GameContract_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"CreateRound"}},
    {"receiver":"internal","message":{"kind":"typed","type":"JoinRound"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetReferrer"}},
    {"receiver":"internal","message":{"kind":"typed","type":"DistributeRound"}},
    {"receiver":"internal","message":{"kind":"text","text":"withdraw_fees"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UpdateFee"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
]


export class GameContract implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = GameContract_errors_backward;
    public static readonly opcodes = GameContract_opcodes;
    
    static async init(admin: Address) {
        return await GameContract_init(admin);
    }
    
    static async fromInit(admin: Address) {
        const __gen_init = await GameContract_init(admin);
        const address = contractAddress(0, __gen_init);
        return new GameContract(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new GameContract(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  GameContract_types,
        getters: GameContract_getters,
        receivers: GameContract_receivers,
        errors: GameContract_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: CreateRound | JoinRound | SetReferrer | DistributeRound | "withdraw_fees" | UpdateFee | Deploy) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'CreateRound') {
            body = beginCell().store(storeCreateRound(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'JoinRound') {
            body = beginCell().store(storeJoinRound(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetReferrer') {
            body = beginCell().store(storeSetReferrer(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'DistributeRound') {
            body = beginCell().store(storeDistributeRound(message)).endCell();
        }
        if (message === "withdraw_fees") {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'UpdateFee') {
            body = beginCell().store(storeUpdateFee(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getGetRound(provider: ContractProvider, roundId: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(roundId);
        const source = (await provider.get('getRound', builder.build())).stack;
        const result_p = source.readTupleOpt();
        const result = result_p ? loadTupleRound(result_p) : null;
        return result;
    }
    
    async getGetReferrer(provider: ContractProvider, user: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(user);
        const source = (await provider.get('getReferrer', builder.build())).stack;
        const result = source.readAddressOpt();
        return result;
    }
    
    async getGetReferralStats(provider: ContractProvider, user: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(user);
        const source = (await provider.get('getReferralStats', builder.build())).stack;
        const result_p = source.readTupleOpt();
        const result = result_p ? loadTupleReferralStats(result_p) : null;
        return result;
    }
    
    async getGetTotalRounds(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('getTotalRounds', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetPlatformFeePercent(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('getPlatformFeePercent', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetReferralPercent(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('getReferralPercent', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
}