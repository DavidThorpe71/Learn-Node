const mongoose = require('mongoose');
const Store = mongoose.model('Store');

exports.homePage = (req, res) => {
	console.log(req.name);
	res.render('index');
};

exports.addStore = (req, res) => {
	res.render('editStore', { title: 'Add Store' });
};

exports.createStore = async (req, res) => {
	const store = await (new Store(req.body)).save();
	req.flash('success', `Successfully created ${store.name}. Care to leave a review?`)
	res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
	// 1. query database for a list of all stores
	const stores = await Store.find();
	res.render('stores', { title: 'Stores', stores });
}

exports.editStore = async (req, res) => {
	// 1. find stiore given the ID
	const store = await Store.findOne({ _id: req.params.id });
	// 2. confirm they are the owner of the store
	// TODO
	// 3. render out the dit form so the user can update their store
	res.render('editStore', { title: `Edit ${store.name}`, store });
}

exports.updateStore = async (req, res) => {
	//find and update store
	const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
		new: true, // returns the new store instead of the old one
		runValidator: true
	}).exec();
	//redirect them to the store and tell them it worked
	req.flash('success', `Sucessfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store</a>`);
	res.redirect(`/stores/${store._id}/edit`);
}