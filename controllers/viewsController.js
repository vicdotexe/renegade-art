const express = require('express');
const { ArtPiece,Keyword,User,Comment, Like } = require('../models');
const router = express.Router();
const sequelize = require('sequelize');



router.get('/home', async (req,res)=>{

    try{
        const allPieces = await ArtPiece.findAll({
            include:[User,Keyword],
            order:sequelize.literal('updatedAt DESC')
        });

        const passedInObject = {
            title: 'Recent Creations',
            activeUser: req.session.activeUser,
            artPieces: allPieces.map(piece=>piece.get({plain:true}))
        }
    
        res.render('home', passedInObject)
    }catch(err){
        console.log(err);
        return res.status(500).json({err:err.message})
    }

})

router.get('/artpiece/:id', async (req,res)=>{

    try{
        const artPiece = await ArtPiece.findOne({
            where:{id:req.params.id},
            include:[Keyword,User,{
                model:Comment,
                include:User
            },{
                model:Like
            }],
            
            });
           
        const passedInObject = {
            activeUser: req.session.activeUser,
            artPiece: artPiece.get({plain:true}),
            isLiked: req.session.activeUser ? artPiece.Likes.some(like=>like.UserId==req.session.activeUser.id) : false
        }
        
        console.log(passedInObject);
        return res.render('art-peice', passedInObject)
    }catch(err){
        console.log(err);
        return res.status(500).json({err:err.message})
    }
})

router.get('/search', async(req,res)=>{
    console.log("SEARCHED");
    console.log(req.query);
    if (!req.query.keywords && !req.query.likedby){
        return res.redirect('/home')
    }
    try{
        let title = [];
        let keywordsWhere;
        if (req.query.keywords){
            console.log("HUHHHHH")
            const keywords = req.query.keywords.split(' ');
            keywordsWhere = {name:keywords}
            title.push("Keywords: " + keywords)
        }

        let likedBy;
        if (req.query.likedby){
            const likedByUser = await User.findByPk(req.query.likedby);
            likedBy = {UserId: req.query.likedby}
            title.push("Liked By: " + likedByUser.username)
        }

        const options = {
            include:[
                User,
                {
                    model:Like,
                    where:likedBy
                },
                {
                    model:Keyword,
                    where:keywordsWhere
            }],
            order:sequelize.literal('updatedAt DESC')
        }

        const allPieces = await ArtPiece.findAll(options);

        const passedInObject = {
            title:title,
            activeUser: req.session.activeUser,
            artPieces: allPieces.map(piece=>piece.get({plain:true}))
        }
    
        res.render('home', passedInObject)
    }catch(err){
        console.log(err);
        return res.status(500).json({err:err.message})
    }

})

router.get('/dashboard', async(req,res)=>{
    if (req.session.activeUser){
        const myPieces = await ArtPiece.findAll({
            where:{UserId:req.session.activeUser.id},
            include:[User,Keyword, Like],
            order:sequelize.literal('updatedAt DESC')
        })
        const passedInObject = {
            activeUser: req.session.activeUser,
            artPieces: myPieces.map(piece=>piece.get({plain:true}))
        }
        return res.render('dashboard', passedInObject);
    }else{
        return res.redirect('/signin')
    }
})

router.get('/gallery/:id', async(req,res)=>{
    try{
        const user = await User.findByPk(req.params.id);

        if (!user){
            return res.redirect('/home');
        }
        const allPieces = await ArtPiece.findAll({
            where:{UserId:req.params.id},
            include:[User,Keyword, Like],
            order:sequelize.literal('updatedAt DESC')
        });
        const passedInObject = {
            activeUser: req.session.activeUser,
            artPieces: allPieces.map(piece=>piece.get({plain:true})),
            galleryOwner: user.get({plain:true})
        }
    
        res.render('gallery', passedInObject)
    }catch(err){
        console.log(err);
        return res.status(500).json({err:err.message})
    }
})

router.get('/signin',(req,res)=>{
    res.render('signin');
})

router.get('/logout', (req,res)=>{
    req.session.destroy((err)=>{
        res.redirect('/home')
    });
})

router.get('/addartpiece',(req,res)=>{
    if (!req.session.activeUser){

    }
    const passedInObject = {
        activeUser: req.session.activeUser
    }
    res.render('add-artpiece', passedInObject)
})
router.get('/edit/:id',async(req,res)=>{
    if (!req.session.activeUser){
        return res.redirect('/signin')
    }

    const artPiece = await ArtPiece.findByPk(req.params.id);
    if (artPiece.UserId != req.session.activeUser.id){
        return res.redirect('/signin')
    }
    const passedInObject = {
        activeUser: req.session.activeUser,
        artPiece: artPiece.get({plain:true})
    }

    res.render('update-art', passedInObject)
})

router.get('/')

router.get('*', (req,res)=>{
    res.redirect('/home');
})


module.exports = router;
