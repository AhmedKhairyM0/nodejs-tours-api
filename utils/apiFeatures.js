class APIFeatures {
  constructor(query, queryReq) {
    this.query = query;
    this.queryReq = queryReq;
  }

  filter() {
    const queryObj = { ...this.queryReq };
    const excludedFields = ["page", "limit", "sort", "fields", "search", "q"];
    excludedFields.forEach((e) => delete queryObj[e]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    console.log(JSON.parse(queryStr));

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  // ** Sorting
  // for ascending: query.sort("price duration")
  // for descending: query.sort("-price -duration") --> putting (-) minus at first
  sort() {
    if (this.queryReq.sort) {
      const sortBy = this.queryReq.sort.split(",").join(" ");
      this.query = this.query.sort(`${sortBy} -createdAt`);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  // ** Fields limiting
  // inclusion => query.select("name duration price")
  // exclusion => query.select("-name -duration -price") --> putting (-) minus at first
  limitFields() {
    if (this.queryReq.fields) {
      const fields = this.queryReq.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    const limit = this.queryReq.limit * 1 || 10;
    const page = this.queryReq.page * 1 || 1;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
