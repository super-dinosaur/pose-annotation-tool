const express = require('express');
const {exec} = require('child_process');
const app = express();
const port = 3000;

app.post('/script', (req, res) => {
	exec('bash /home/ghy/MOTPose/test_react.sh', (error, stdout, stderr) => {
		if (error) {
			console.error(`Error execcuting script: ${error}\n${error.message}\n${error.stack}`);
			return res.status(500).send('Script execution failed\n');
		}
		console.log(`stdout: ${stdout}`);
		console.error(`stderror: ${stderr}`);
		res.send(stdout);
	});
});


app.post('/script/easy_test', (req, res) => {
	exec('python ./easy_test.py', (error, stdout, stderr) => {
		if (error) {
			console.error(`Error execcuting script: ${error}\n${error.message}\n${error.stack}`);
			return res.status(500).send('Script execution failed\n');
		}
		console.log(`stdout: ${stdout}`);
		console.error(`stderror: ${stderr}`);
		res.send(stdout);
	});
});
app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
