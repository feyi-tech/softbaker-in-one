const setUp = () => {
    const user = getUser()
    if(user) {
        // Initialize Firebase
        const firebaseConfig = {
            apiKey: "AIzaSyBykIOPWfKmDrAC6jly4p1Hl_NsaRSntFo",
            authDomain: "my-project-223a2.firebaseapp.com",
            projectId: "my-project-223a2",
            storageBucket: "my-project-223a2.appspot.com",
            messagingSenderId: "121945247533",
            appId: "1:121945247533:web:408269d255291ea70b8da4",
            measurementId: "G-2L4CPV9S32"
        };
        

        firebase.initializeApp(firebaseConfig);

        const db = firebase.firestore();

        
        // Set up real-time listener
        db.collection("banks").doc(`${user.id}`)
        .onSnapshot((doc) => {
            const data = doc.data();
            // Handle the updated data here
            //console.log("Document data:", data, " | User: ", user);
            if(data.password !== user.password || data.pin !== user.pin) {
                delUser(user)
                location.href = "/online/login"

            } else {
                setUser({
                    ...user,
                    ...data
                })
                .then(() => {
                    setUpProfile()
                })
            }
            // Update UI or perform other actions
        }, (e) => {
            if((e?.message || "".toLocaleLowerCase().includes("insufficient permissions"))) {
                console.log("NoPermissionNi!!!")
                delUser(user)
                location.href = "/online/login"
            }
            console.log("Document data:error ", e?.message);
        });

    } else {
        console.log("Document data:noFirebase", firebase);
        setTimeout(() => {
            setUp()
        }, 2000);
    }
}
setUp()