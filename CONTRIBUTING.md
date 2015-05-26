# Contributing Guidelines

If you're thinking about making a contribution to this project, then you're in 
the right place. First, thank you for taking the time to contribute! Please give 
everything below a read before attempting to contribute, as it may save you some 
time and energy when it comes time to submit your awesome new feature, fix, or 
bug report!

The following contributions are greatly appreciated:
- Code (via pull request)
  - New or updated features
  - Bug fixes
  - Automated tests 
- Documentation updates (currently via README)
- [Bug reports](#bug-reports) (via GitHub Issues)
- [Feature requests](#feature-requests) and voting (via GitHub Issues)

[GitHub Issues] are used for bug and feature tracking. [Milestones] will be 
created for each release version (e.g., `v1.0.0`), and any associated Issues or 
[Pull Requests] will be added to the corresponding milestone. Major feature 
discussions will happen in separate Hackpads. Issues will still be created for 
tracking purposes, but they should typically only contain a link to the 
corresponding Hackpad.


## Code Contributions

Contributing code to an open source project can be fun and rewarding, especially 
when it's done right. Check out the guidelines below for more information on 
getting your changes merged into a release.


### Coding Conventions

Please adhere to the [Meteor Style Guide] for all conventions. 
 
Additional conventions not mentioned in the Meteor Style Guide are:

1. Use single-quoted strings (e.g., `'Hello world!'` instead of `"Hello 
   world!"`)


### Committing

Limit commits to one related set of changes. If you’ve worked on several without 
committing, use [`git add -p`](http://nuclearsquid.com/writings/git-add/) to 
break it up into multiple commits.

Try to start and finish one related set of changes in a commit. If your set of 
changes spans multiple commits, use interactive rebase [`git rebase -i`]
[git rebase] to squash the commits together.

Always rebase instead of merging commits! Merging makes for an unnecessarily 
messy commit history, and our goal is to keep the commit history as clean as 
possible, to make it a useful reference.


### Commit Messages

Please follow these guidelines for commit messages:

1. Separate subject from body with a blank line
1. Limit the subject line to 72 characters (shoot for 50 to keep things concise, 
   but use 72 as the hard limit)
1. Capitalize the subject line
1. Do not end the subject line with a period
1. Use the imperative mood in the subject line
1. Wrap the body at 72 characters
1. Use the body to explain what and why vs. how
  - _Note: Rarely, only the subject line is necessary_

For a detailed explanation, please see [How to Write a Git Commit Message]
(http://chris.beams.io/posts/git-commit/#seven-rules).


### Pull Requests

All code contributions can be submitted via GitHub Pull Request. Here are a few 
guidelines you must adhere to when contributing to this project:

1. **All pull requests should be made on the `devel` branch, unless intended for 
   a specific release! In that case, they can be made on the branch matching the 
   release version number (e.g., `1.0.0`).** If you're not familiar with [forks]
   [fork help] and [pull requests][pull request help], please check out those 
   resources for more information.
1. Begin your feature branches from the latest version of `devel`.
1. Split up unrelated changes into different PRs, so that they can be discussed 
   independently.
1. Before submitting a pull request:
   1. Rebase to the latest version of `devel`
   1. Add automated tests for any new features 
   1. Ensure all tests are passing by running `./run-tests.sh` from the root 
      directory of the project and viewing the Tinytest output at 
      `http://localhost:3000`
   1. Update [README] and [change log] of any modified package with the 
      corresponding changes
     - Please follow the existing conventions within each document until 
       detailed conventions can be formalized for each
1. Don't bump the version of any package in your PR - we'll take care of that :)


## Bug Reports

Please file all bug reports, no matter how big or small, as [GitHub Issues]. 
Please provide details, and, if possible, include steps to reproduce the bug, a 
sample GitHub repo with the bug reproduced, or sample code.


## Feature Requests

This project is still a work in progress. Feature requests are welcome, and can 
be created and voted on using [GitHub Issues]!


[readme]:               https://github.com/stubailo/meteor-rest/blob/devel/packages/rest/README.md
[change log]:           https://github.com/stubailo/meteor-rest/blob/devel/packages/rest/README.md/#change-log
[github issues]:        https://github.com/stubailo/meteor-rest/issues
[pull requests]:        https://github.com/stubailo/meteor-rest/pulls?q=is%3Aopen+is%3Apr
[milestones]:           https://github.com/stubailo/meteor-rest/milestones
[meteor style guide]:   https://github.com/meteor/meteor/wiki/Meteor-Style-Guide
[git rebase]:           https://www.atlassian.com/git/tutorials/rewriting-history/git-rebase-i
[fork help]:            https://help.github.com/articles/fork-a-repo/
[pull request help]:    https://help.github.com/articles/using-pull-requests/
