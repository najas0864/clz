document.forms[0].addEventListener('submit', async e => {
      e.preventDefault();
        const data = await fetch('/submitAns',{
            headers: {
                "Cache-Control": "max-age=60480",
            },
            body:e.target
        })
        console.log(e)
      console.log(e)
});
