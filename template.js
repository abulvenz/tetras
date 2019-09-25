const templates = [

    // ####
    {
        form: 1,
        color: {
            r: 1, g: 0, b: .5, a: 1
        },
        parts: [
            {
                col: -1, row: 0
            },
            {
                col: 0, row: 0
            },
            {
                col: 1, row: 0
            },
            {
                col: 2, row: 0
            }
        ]
    },

    // ###
    //   #
    {
        form:2,
        color: {
            r: .5, g: 1, b: .5, a: 1
        },
        parts:
            [
                {
                    col: -2, row: 0
                },
                {
                    col: -1, row: 0
                },
                {
                    col: 0, row: 0
                },
                {
                    col: 0, row: 1
                }
            ]
    },
    {
        form:2,
        color: {
            r: .5, g: 1, b: .5, a: 1
        },
        parts:
            // ###
            // #  
            [
                {
                    col: 0, row: 0
                },
                {
                    col: 1, row: 0
                },
                {
                    col: 2, row: 0
                },
                {
                    col: 0, row: 1
                }
            ]
    },

    // ###
    //  #
    {
        form:3,
        color: {
            r: .5, g: .5, b: 1, a: 1
        },
        parts:
            [
                {
                    col: -1, row: 0
                },
                {
                    col: 0, row: 0
                },
                {
                    col: 1, row: 0
                },
                {
                    col: 0, row: 1
                }
            ]
    },
    {
        form:4,
        color: {
            r: .5, g: 1, b: 1, a: 1
        },
        parts:
            //  ##
            // ##
            [
                {
                    col: 0, row: 0
                },
                {
                    col: 1, row: 0
                },
                {
                    col: -1, row: 1
                },
                {
                    col: 0, row: 1
                }
            ]
    },
    // ##
    //  ##
    {
        form:4,
        color: {
            r: .5, g: 1, b: 1, a: 1
        },
        parts: [
            {
                col: 0, row: 0
            },
            {
                col: -1, row: 0
            },
            {
                col: 1, row: 1
            },
            {
                col: 0, row: 1
            }
        ]
    },
    {
        form:5,
        color: {
            r: .5, g: .5, b: .5, a: 1
        },
        parts:
            // ##
            // ##
            [
                {
                    col: 0, row: 0
                },
                {
                    col: 1, row: 0
                },
                {
                    col: 1, row: 1
                },
                {
                    col: 0, row: 1
                }
            ]
    }
];

export default templates;