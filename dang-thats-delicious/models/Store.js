const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,
		required: 'Please enter a store name!'
	},
	slug: String,
	description: {
		type: String,
		trim: true
	},
	tags: [String],
	created: {
		type: Date,
		default: Date.now
	},
	location: {
		type: {
			type: String,
			default: 'Point'
		},
		coordinates: [{
			type: Number,
			required: 'You must supply coordinates!'
		}],
		address: {
			type: String,
			required: 'You must supply an address!'
		}
	},
	photo: String,
	author: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: 'You must supply an author'
	}
}, {
	toJSON: { virtuals: true },
	toObject: { virtuals: true}
});

// Define our indexes
storeSchema.index({
	name: 'text',
	description: 'text'
});

storeSchema.index({ location: '2dsphere' });

storeSchema.pre('save', async function(next) {
	if(!this.isModified('name')) {
		next(); // Skip it
		return; // Stop this function from running
	}
	this.slug = slug(this.name);
	// find other stores that have the same slug, slug-1, slug-2 etc
	const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
	const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
	if(storesWithSlug.length) {
		this.slug =`${this.slug}-${storesWithSlug.length + 1}`;
	}
	next();
	// TODO make more resillient so slugs are unique
});

storeSchema.statics.getTagsList = function() {
	return this.aggregate([
		{ $unwind: '$tags' },
		{ $group: { _id: '$tags', count: { $sum: 1} }},
		{ $sort: { count: -1 }}
	]);
}

// find reviews where the stores _id property === reviews store property
storeSchema.virtual('reviews', {
	ref: 'Review', // what model to link
	localField: '_id', // which field on the store
	foreignField: 'store' // which field on the review
});

module.exports = mongoose.model('Store', storeSchema);