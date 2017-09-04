exports.myMiddleware = (req, res, next) => {
	req.name = 'David';
	if(req.name === 'David') {
		throw Error('That is a stupid name');
	}
	next();
}

exports.homePage = (req, res) => {
	console.log(req.name);
	res.render('index');
}