const postTest = async(name, job)=>{
    const fetchObj ={
        method :"get",
        headers : {
            'Content-Type' : 'application/json'
        },
        body:JSON.stringify({
            "name" : 1,
            "job" : 2
        })
    }

    const init = await fetch("http://192.168.0.34:8080/Homework01/FindUser?id=test1", fetchObj);
    const data = await init.json()
    alert(JSON.stringify(data));
}