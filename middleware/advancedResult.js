const advanceResults = (model, populate) => async(req, res, next) => {
    let query;

    //Copy req.query 
    const reqQuery = {...req.body };

    //Fields to exclude
    const removeFields = ['select', 'sort', 'limit'];

    //loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    // console.log(reqQuery);

    //Create query string
    let queryStr = JSON.stringify(reqQuery);
    //Create operators like ($gt, $gte, etc..)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    //Finding resources
    query = model.find(JSON.parse(queryStr)).populate('courses');

    //Select Fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        // console.log(fields);
        query = query.select(fields);
    }

    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    //Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const total = await model.countDocuments();
    query = query.skip(startIndex).limit(limit);

    if (populate) {
        query = query.populate(populate);
    }
    //Executing query
    const results = await query;

    //Pagination result
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }

    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    };
    res.advanceResults = {
        success: true,
        count: results.length,
        pagination: pagination,
        data: results
    }

    next();
}

module.exports = advanceResults;