class Container {
    constructor(type) {
        this.garbageCount = 0;
        this.type = type;
    }

    putGarbage(value) {
        if (this.verifyLimit()) {
            this.garbageCount += value;
        }
    }

    resetCount() {
        this.garbageCount = 0;
    }

    verifyLimit() {
        return this.garbageCount < 100;
    }
}

module.exports = Container;