//mokcup che sostituisce con una versione fake un modulo npm. Si devono esportare l'API pubblica che si utilizza e il modulo npm deve essere
//contenuto in un file con il medesimo nome, cartella top con il nome dello scope se esiste e tutto sotto __mocks__
module.exports = {
    setApiKey() {},
    send() {
        return Promise.resolve("OK");
    },
};
