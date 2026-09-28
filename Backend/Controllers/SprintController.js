const SprintModel = require('../Models/SprintModel');
const ProjectModel = require('../Models/ProjectModel');
const UseCaseModel = require('../Models/UseCaseModel');

const SprintController = {

    async createSprint(req, res) {

        try {

            const {
                ProjectID,
                SprintName,
                SprintGoal,
                StartDate,
                EndDate,
                Status,
                CreatedBy
            } = req.body;


            if (!ProjectID) {

                return res.status(400).json({
                    message: 'ProjectID is required'
                });

            }


            if (
                !SprintName ||
                !SprintName.trim()
            ) {

                return res.status(400).json({
                    message: 'Sprint Name is required'
                });

            }


            if (!StartDate || !EndDate) {

                return res.status(400).json({
                    message:
                        'StartDate and EndDate are required'
                });

            }

            if (new Date(EndDate) < new Date(StartDate)) {
                return res.status(400).json({
                    message: 'Sprint End Date cannot be earlier than Start Date'
                });
            }


            if (!CreatedBy) {

                return res.status(400).json({
                    message: 'CreatedBy is required'
                });

            }

            const project = await ProjectModel.getProjectById(Number(ProjectID));
            if (!project) {
                return res.status(404).json({ message: 'Project not found' });
            }
            if (!project.managerId) {
                return res.status(400).json({ message: 'A manager must be assigned to the project before creating a sprint' });
            }

            const useCases = await UseCaseModel.getUseCasesByProject(Number(ProjectID));
            if (!useCases || useCases.length === 0) {
                return res.status(400).json({ message: 'At least one use case must be created for the project before creating a sprint' });
            }


            const sprint =
                await SprintModel.createSprint({

                    ProjectID:
                        Number(ProjectID),

                    UseCaseID:
                        req.body.UseCaseID ? Number(req.body.UseCaseID) : null,

                    SprintName:
                        SprintName.trim(),

                    SprintGoal:
                        SprintGoal?.trim() || null,

                    StartDate,

                    EndDate,

                    Status:
                        Status || 'Planned',

                    CreatedBy:
                        Number(CreatedBy)

                });


            return res.status(201).json({

                message:
                    'Sprint created successfully',

                data: sprint

            });

        }

        catch (error) {

            console.error(
                'Create Sprint Error:',
                error
            );

            let errorMessage = error.message || 'Failed to create Sprint';
            if (errorMessage.includes('CK_Sprints_Dates')) {
                errorMessage = 'Sprint End Date must be greater than or equal to Start Date.';
            }

            return res.status(400).json({

                message:
                    errorMessage,

                error:
                    error.message

            });

        }

    },


    async getSprintsByProject(req, res) {

        try {

            const projectID =
                Number(req.params.projectId);


            if (!projectID) {

                return res.status(400).json({
                    message: 'Invalid ProjectID'
                });

            }


            const sprints =
                await SprintModel
                    .getSprintsByProject(projectID);


            return res.status(200).json(
                sprints
            );

        }

        catch (error) {

            console.error(
                'Get Sprints Error:',
                error
            );

            return res.status(500).json({

                message:
                    'Failed to load Sprints',

                error:
                    error.message

            });

        }

    }

};

module.exports = SprintController;