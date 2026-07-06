/*
 * Jenkins Declarative Pipeline for the Playwright + TypeScript POM / Data-Driven framework.
 *
 * Prerequisites on the Jenkins controller/agent:
 *   1. NodeJS plugin configured with a tool named "Node20" (Manage Jenkins > Tools)
 *   2. HTML Publisher plugin installed (for publishHTML step)
 *   3. Email Extension Plugin (emailext) installed and configured
 *      (Manage Jenkins > Configure System > Extended E-mail Notification)
 *   4. junit plugin (bundled by default) for test result trend graphs
 */
pipeline {
    agent any

    tools {
        nodejs 'Node20'
    }

    environment {
        BASE_URL = 'https://www.saucedemo.com'
        CI = 'true'
    }

    options {
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Install Browsers') {
            steps {
                sh 'npx playwright install --with-deps'
            }
        }

        stage('Type Check') {
            steps {
                sh 'npm run typecheck'
            }
        }

        stage('Run Playwright Tests') {
            steps {
                // Do not fail the build immediately - let post-actions run,
                // final result is set explicitly at the end of the pipeline.
                script {
                    def status = sh(script: 'npx playwright test', returnStatus: true)
                    env.TEST_STATUS = status.toString()
                }
            }
        }

        stage('Zip HTML Report') {
            steps {
                sh 'zip -r playwright-report.zip playwright-report || true'
            }
        }
    }

    post {
        always {
            // Publish JUnit results so Jenkins shows the pass/fail trend graph
            junit allowEmptyResults: true, testResults: 'test-results/junit-results.xml'

            // Publish the interactive HTML report as a Jenkins tab
            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright HTML Report'
            ])

            archiveArtifacts artifacts: 'playwright-report.zip, test-results/**', allowEmptyArchive: true

            // Email the report to the team on every run (pass or fail)
            emailext(
                subject: "Playwright Test Report - ${currentBuild.currentResult} - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                mimeType: 'text/html',
                body: """
                    <h2>Playwright Test Run: ${currentBuild.currentResult}</h2>
                    <p><b>Job:</b> ${env.JOB_NAME}</p>
                    <p><b>Build:</b> #${env.BUILD_NUMBER}</p>
                    <p><b>Duration:</b> ${currentBuild.durationString}</p>
                    <p>Full HTML report attached (playwright-report.zip) and available in the
                    <a href="${env.BUILD_URL}Playwright_20HTML_20Report/">Jenkins Playwright HTML Report tab</a>.</p>
                    <p><a href="${env.BUILD_URL}">View Build</a></p>
                """,
                attachmentsPattern: 'playwright-report.zip, test-results/junit-results.xml',
                to: '${DEFAULT_RECIPIENTS}',
                recipientProviders: [[$class: 'DevelopersRecipientProvider']]
            )

            script {
                if (env.TEST_STATUS != '0') {
                    currentBuild.result = 'FAILURE'
                    error("Playwright tests failed with exit code ${env.TEST_STATUS}")
                }
            }
        }
    }
}
