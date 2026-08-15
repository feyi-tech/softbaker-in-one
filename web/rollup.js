const { exec } = require("child_process");

const arg = process.argv
const commitMessage = arg.length == 3? arg[2] : null
const skipBuildPush = arg.length == 4 && arg[3] === "skipbuild"
const skipSourcePush = arg.length == 4 && arg[3] === "skipsrc"
console.log(arg, commitMessage)
if(commitMessage) {
    const buildCommand = 
    `next build && ` + //build the app
    `mv build/.git build-git/ && ` + //move the .git data to a temp folder
    `next export -o build && ` + //export the app as static files to the build folder
    `mv build-git/ build/.git && ` + //move the .git data back to the build folder
    `cd build && ` + //change directory to the build folder
    `git add . && ` + //add all the changes to the .git data
    `git commit -m "${commitMessage}" && ` + //commit the added changes with the provided message
    `git push && ` + //push the commit to the origin
    `cd -`; //change directory back to the previous directory we took here(the source code folder)

    const sourceCommand = 
    `git add . && ` + //add all the changes in the source code to git
    `git commit -m "${commitMessage}" && ` + //commit all the changes
    `git push`

    var command = !skipBuildPush? buildCommand : ""
    if(!skipSourcePush) {
        command += !skipBuildPush? ` && ${sourceCommand}` :  sourceCommand
    }
    if(command.length > 0) {
        console.log(`With message ${commitMessage}, running the command: ${command}`)
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
        })

    } else {
        console.log(`Has message ${commitMessage}, but no command.`)
    }

} else {
    console.log(`No commitMessage found`)
}
