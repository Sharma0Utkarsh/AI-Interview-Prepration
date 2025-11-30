const Session = require("../models/Session");
    const Question = require("../models/Question");
    
    //@desc Create New Session And Linked Question 
    //@route Post/api/sessions/create
    //@access Private
    
    exports.createSession = async (req,res) =>{
        try {
            const { role, experience, topicsToFocus, description, questions }=
            req.body;
            const userId = req.user._id;//Assuming you have a middlewae setting req.user
    
            const session = await Session.create({
                user: userId,
                role,
                experience,
                topicsToFocus,
                description,
            });
    
            const questionDocs = await Promise.all(
                questions.map(async (q)=>{
                    const question = await Question.create({
                        session: session._id,
                        question: q.question,
                        answer: q.answer, // Make sure answer is passed from AI
                    });
                    return question._id;
                })
            );
    
            session.questions = questionDocs;
            await session.save();
    
            res.status(201).json({success: true, session});
        } catch (error) {
            console.error("Error in createSession:", error); // Added log
            res.status(500).json({success: false, message: "server Error"});
            
        }
    };
    
    //@desc get all sessions for the logged-in user
    //@route get/api/sessions/my-sessions
    //@access Private
    exports.getMySessions = async (req,res) =>{
        try {
            const sessions = await Session.find({user:req.user.id})
            .sort({createdAt:-1})
            .populate("questions");
            res.status(200).json(sessions);
        } catch (error) {
             console.error("Error in getMySessions:", error);
            res.status(500).json({success: false, message: "Unable to get the session"});
            
        }
    };
    
    //@desc get a session by id with populated questions
    //@route get/api/sessions/:id
    //@access Private
    exports.getSessionById= async (req,res) =>{
        try {
            const session = await Session.findById(req.params.id)
            .populate({
                path: "questions",
                options: {sort:{isPinned: -1, createdAt: 1}},
            })
            .exec();
    
            if (!session){
                return res
                .status(404)
                .json({success:false, message:"Session not found"});
            }
            res.status(200).json({success:true,session});
        } catch (error) {
            console.error("Error in getSessionById:", error); // Added log
            res.status(500).json({success: false, message: "server Error"});
            
        }
    };
    
    //@desc Delete a session and its question
    //@route DELETE / api/sessions/:id
    //@access Private
    exports.deleteSession = async (req,res)=>{
        try {
            const session = await Session.findById(req.params.id);
            if(!session){
                return res.status(404).json({message:"Session not found"});
            }
    
            //check if the logged-in user owns this session
            if(session.user.toString() !== req.user.id){
                return res
                .status(401)
                .json({ message : "Not authorized to delete this session"});
            }
    
            //First, delete all questions linked to this session
            await Question.deleteMany({session : session._id});
    
            //Then Delete the session
            // Use findByIdAndDelete (or session.deleteOne() if available)
            await Session.findByIdAndDelete(req.params.id);
    
            res.status(200).json({message:"Session deleted sucessfully"});
            
        } catch (error) {
            console.error("Error in deleteSession:", error); // Added log
            res.status(500).json({success: false, message: "server Error"});
            
        }
    };