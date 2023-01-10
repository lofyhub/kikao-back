const regex = {
    signatureRegex: new RegExp(/(?:[0-9]|[a-f]){128}/),
    keyRegex: new RegExp(/(?:[0-9]|[a-f]){64}/),
    authorIdRegex: new RegExp(/^(?:[0-9]|[a-z]|[A-Z]|\.|_)+$/), // TODO: remove dot from regex
    emailRegex: new RegExp(
        /^[a-zA-Z0-9.!#$%&'+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/
    ),
    urlRegex: new RegExp(
        /^((http:\/\/)|(https:\/\/))?(((\w|-){1,63})\.)?((\w|-){1,253})\.([a-z]{2,63})(\/.*)?$/
    ),
    passWord: new RegExp(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
    ),
    tagNameRegex: new RegExp(/^(?:\w|-)+$/),
    userName: new RegExp(/^[a-zA-Z0-9._-]{3,32}$/),
    encContentRegex: new RegExp(/^[a-fA-F0-9]+$/),
    githubProfileRegex: new RegExp(
        /^(http(s?):\/\/)?(www.)?github.com\/([A-Za-z0-9-]+)\/?$/,
        'i'
    ),
    facebookProfileRegex: new RegExp(
        /^(http(s?):\/\/)?(www.)?facebook.com\/([A-Za-z0-9.]+)\/?$/,
        'i'
    ),
    instagramProfileRegex: new RegExp(
        /^(http(s?):\/\/)?(www.)?instagram.com\/([A-Za-z0-9._]+)\/?$/,
        'i'
    ),
    twitterProfileRegex: new RegExp(
        /^(http(s?):\/\/)?(www.)?twitter.com\/([A-Za-z0-9_]+)\/?$/,
        'i'
    ),
    linkedinProfileRegex: new RegExp(
        /^(http(s?):\/\/)?(www.)?linkedin.com\/in\/([A-Za-z0-9-]+)\/?$/,
        'i'
    ),
    mediumProfileRegex: new RegExp(
        /^(http(s?):\/\/)?(www.)?medium.com\/@([A-Za-z0-9-]+)\/?$/,
        'i'
    ),
    redditProfileRegex: new RegExp(
        /^(http(s?):\/\/)?(www.)?reddit.com\/user\/([A-Za-z0-9-_]+)\/?$/,
        'i'
    )
};

export default regex;
