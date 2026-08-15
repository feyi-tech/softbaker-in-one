
(() => {
    const result = Array.from(document.getElementsByClassName("mdc-data-table__row")).map(row => {
        const cells = row.getElementsByTagName("td");
        return {
            salt: cells[0]?.innerText.trim(),
            wei: cells[1]?.innerText.trim().replace(/"/g, "")
        };
    });
    
    console.log(result);
})()