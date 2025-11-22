
class LinkNode{
    constructor(data){
        this.pre = this 
        this.nxt = this 
        this.data = data
    }
}

class LinkArray{
    constructor(){
        this.head = null;
        this.tail = null;
        this.sz = 0
    }
    append(a){
        let nn = new LinkNode(a)
        this.sz += 1
        if (this.head === null) {
            this.head = this.tail = nn;
            return;
        }
        nn.pre = this.tail;
        nn.nxt = this.head;
        this.tail.nxt = nn;
        this.head.pre = nn;
        this.tail = nn;
    }

}


class MyPromiseCenter{
    constructor(){
        this.link_array = new LinkArray()
    }
    register(mypromise) {
        this.link_array.append(mypromise)
    }
    run() {
        let done_count=0;
        while(done_count < this.link_array.sz) {
            done_count = 0;
            let it = this.link_array.head
            let centerWaitingfunc = function * (p, p2) {
                p.status = 2;
                p2.then(function*(data, watingfunc){
                    p.status = 5;
                    return data;
                })
                yield
            }
            do{
                if (it.data.status ===1 ) {
                    it.run_iter = it.data.run(centerWaitingfunc);
                    it.run_iter.next();
                }
                if (it.data.status === 5) {
                    it.run_iter.next()
                }
                if(it.data.status === 0) {
                    done_count+=1
                }
                it = it.nxt
            }while(it !=this.link_array.head);
        }
    }

}
let mypromise_center = new MyPromiseCenter()
class MyPromise{
    constructor(func){
        this.status = 1
        this.data = null;
        this.func = func
        this.then_func_array=[]
        mypromise_center.register(this);
    }
    then(func) {
        let tmp =this.func;
        function* new_func(f, watingfunc) {
            return yield* f(yield* tmp(func, watingfunc), watingfunc)
        }
        this.func = new_func
        return this
    }
    run = function * (centerWaitingfunc) {
        this.status = 3;
        let haha = this;
        function * watingfunc(e) {
            return yield* centerWaitingfunc(haha, e)
        }
        this.data = yield * this.func(function * (e, watingfunc){return e}, watingfunc);
        this.status = 0;
    }
}

for(let i of [1,2,3,4,5]){
    let j = i;
    new MyPromise(function * (resolve, watingfunc){
        console.log(`${j} start running`)
        yield * (watingfunc(new MyPromise(function *(r,w){
            console.log(`${j+5} start running`);
            r(j+5, w);
        }).then((d)=>{
            console.log(`${d} finish running`)
        })))
        resolve(i, watingfunc)
    }).then((i)=>{
        console.log(`${i} finish running`)
    })
}


mypromise_center.run()