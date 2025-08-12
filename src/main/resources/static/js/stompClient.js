export let stompClient = new StompJs.Client({
    brokerURL: '/tetruau?token=' + localStorage.getItem('token')
});

if (localStorage.getItem('username')) {
    stompClient.activate()
}



export function deactivateClient() {
    if (stompClient) {

        console.log("desativando")
        stompClient.deactivate()

    }
}

