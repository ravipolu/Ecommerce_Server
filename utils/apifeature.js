class ApiFeatures {
    constructor(query,queryStr){ // queryStr=== keywords jo link me se uthaye ge, query hai jaise Product.find(),Product.findById() etc...
        this.query=query;
        this.queryStr=queryStr;
    }

    search(){
        const keyword = this.queryStr.keyword
        ?{
            name:{
                $regex:this.queryStr.keyword,
                $options: "i" , //case insensitive
            }
        }:{}

        // console.log(keyword);

        this.query = this.query.find({...keyword});
        return this;
    }

    filter(){
        const queryCopy = {...this.queryStr};
        // console.log('1',queryCopy);
        const removeFeilds = ["keyword", "page", "limit"];
        
        removeFeilds.forEach((key) => delete queryCopy[key]);
        // console.log('2',queryCopy);
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);
        
        this.query = this.query.find(JSON.parse(queryStr));
        
        return this;
    }

    pagination(resultPerPage){
        const currentPage= Number(this.queryStr.page) || 1;

        const skip = resultPerPage * (currentPage-1);

        this.query = this.query.limit(resultPerPage).skip(skip);

        return this;

    }
}


module.exports = ApiFeatures; 